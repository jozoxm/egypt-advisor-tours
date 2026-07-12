import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookingForm from '../../components/BookingForm';

describe('BookingForm', () => {
  it('renders all form fields', () => {
    render(<BookingForm />);
    expect(screen.getByLabelText(/^name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^phone:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tour selection:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^date:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of travelers:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/special requests:/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<BookingForm />);
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('starts with empty fields', () => {
    render(<BookingForm />);
    expect(screen.getByLabelText(/^name:/i)).toHaveValue('');
    expect(screen.getByLabelText(/^email:/i)).toHaveValue('');
    expect(screen.getByLabelText(/^phone:/i)).toHaveValue('');
    expect(screen.getByLabelText(/^date:/i)).toHaveValue('');
  });

  it('updates name field on change', () => {
    render(<BookingForm />);
    const nameInput = screen.getByLabelText(/^name:/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe', name: 'name' } });
    expect(nameInput).toHaveValue('John Doe');
  });

  it('updates email field on change', () => {
    render(<BookingForm />);
    const emailInput = screen.getByLabelText(/^email:/i);
    fireEvent.change(emailInput, { target: { value: 'john@example.com', name: 'email' } });
    expect(emailInput).toHaveValue('john@example.com');
  });

  it('updates phone field on change', () => {
    render(<BookingForm />);
    const phoneInput = screen.getByLabelText(/^phone:/i);
    fireEvent.change(phoneInput, { target: { value: '+1-555-1234', name: 'phone' } });
    expect(phoneInput).toHaveValue('+1-555-1234');
  });

  it('updates special requests field on change', () => {
    render(<BookingForm />);
    const textarea = screen.getByLabelText(/special requests:/i);
    fireEvent.change(textarea, { target: { value: 'Vegetarian meals', name: 'specialRequests' } });
    expect(textarea).toHaveValue('Vegetarian meals');
  });

  it('renders tour selection dropdown with options', () => {
    render(<BookingForm />);
    expect(screen.getByLabelText(/tour selection:/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /select a tour/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tour 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tour 2' })).toBeInTheDocument();
  });

  it('updates tour selection on change', () => {
    render(<BookingForm />);
    const select = screen.getByLabelText(/tour selection:/i);
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

  it('calls preventDefault when the form is submitted', () => {
    render(<BookingForm />);
    const form = screen.getByRole('button', { name: /book now/i }).closest('form');
    const preventDefaultSpy = jest.spyOn(Event.prototype, 'preventDefault');

    fireEvent.submit(form);

    expect(preventDefaultSpy).toHaveBeenCalled();
    preventDefaultSpy.mockRestore();
  });
});
