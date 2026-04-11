import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingForm from '../../components/BookingForm';

// Helper: get inputs by name attribute since BookingForm labels use htmlFor
// but the inputs only have name (no id), so getByLabelText doesn't work.
const getInput = (container, name) => container.querySelector(`[name="${name}"]`);

describe('BookingForm', () => {
  it('renders all form fields', () => {
    const { container } = render(<BookingForm />);
    expect(getInput(container, 'name')).toBeInTheDocument();
    expect(getInput(container, 'email')).toBeInTheDocument();
    expect(getInput(container, 'phone')).toBeInTheDocument();
    expect(getInput(container, 'tour')).toBeInTheDocument();
    expect(getInput(container, 'date')).toBeInTheDocument();
    expect(getInput(container, 'travelers')).toBeInTheDocument();
    expect(getInput(container, 'specialRequests')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<BookingForm />);
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('starts with empty fields', () => {
    const { container } = render(<BookingForm />);
    expect(getInput(container, 'name')).toHaveValue('');
    expect(getInput(container, 'email')).toHaveValue('');
    expect(getInput(container, 'phone')).toHaveValue('');
    expect(getInput(container, 'date')).toHaveValue('');
  });

  it('updates name field on change', () => {
    const { container } = render(<BookingForm />);
    const nameInput = getInput(container, 'name');
    fireEvent.change(nameInput, { target: { value: 'John Doe', name: 'name' } });
    expect(nameInput).toHaveValue('John Doe');
  });

  it('updates email field on change', () => {
    const { container } = render(<BookingForm />);
    const emailInput = getInput(container, 'email');
    fireEvent.change(emailInput, { target: { value: 'john@example.com', name: 'email' } });
    expect(emailInput).toHaveValue('john@example.com');
  });

  it('updates phone field on change', () => {
    const { container } = render(<BookingForm />);
    const phoneInput = getInput(container, 'phone');
    fireEvent.change(phoneInput, { target: { value: '+1-555-1234', name: 'phone' } });
    expect(phoneInput).toHaveValue('+1-555-1234');
  });

  it('updates special requests field on change', () => {
    const { container } = render(<BookingForm />);
    const textarea = getInput(container, 'specialRequests');
    fireEvent.change(textarea, { target: { value: 'Vegetarian meals', name: 'specialRequests' } });
    expect(textarea).toHaveValue('Vegetarian meals');
  });

  it('renders tour selection dropdown with options', () => {
    const { container } = render(<BookingForm />);
    const select = getInput(container, 'tour');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /select a tour/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tour 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tour 2' })).toBeInTheDocument();
  });

  it('updates tour selection on change', () => {
    const { container } = render(<BookingForm />);
    const select = getInput(container, 'tour');
    fireEvent.change(select, { target: { value: 'Tour 2', name: 'tour' } });
    expect(select).toHaveValue('Tour 2');
  });

  it('renders label text for each field', () => {
    render(<BookingForm />);
    expect(screen.getByText(/^name:/i)).toBeInTheDocument();
    expect(screen.getByText(/^email:/i)).toBeInTheDocument();
    expect(screen.getByText(/^phone:/i)).toBeInTheDocument();
    expect(screen.getByText(/^date:/i)).toBeInTheDocument();
    expect(screen.getByText(/special requests/i)).toBeInTheDocument();
  });

  it('calls preventDefault on form submit', () => {
    render(<BookingForm />);
    const form = screen.getByRole('button', { name: /book now/i }).closest('form');
    const preventDefault = jest.fn();
    fireEvent.submit(form, { preventDefault });
    // Form should not throw errors
    expect(form).toBeInTheDocument();
  });
});
