import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Contact from '../../pages/Contact';

describe('Contact', () => {
  it('renders the main heading', () => {
    render(<Contact />);
    expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<Contact />);
    expect(screen.getByText(/info@egyptadvisortours\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/\+20/)).toBeInTheDocument();
    expect(screen.getByText(/Cairo, Egypt/i)).toBeInTheDocument();
  });

  it('renders the contact form fields', () => {
    render(<Contact />);
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your phone/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/what is this about/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your message here/i)).toBeInTheDocument();
  });

  it('renders the Send Message button', () => {
    render(<Contact />);
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('updates name field on change', () => {
    render(<Contact />);
    const nameInput = screen.getByPlaceholderText(/your name/i);
    fireEvent.change(nameInput, { target: { value: 'Alice', name: 'name' } });
    expect(nameInput).toHaveValue('Alice');
  });

  it('updates email field on change', () => {
    render(<Contact />);
    const emailInput = screen.getByPlaceholderText(/your@email\.com/i);
    fireEvent.change(emailInput, { target: { value: 'alice@example.com', name: 'email' } });
    expect(emailInput).toHaveValue('alice@example.com');
  });

  it('updates message field on change', () => {
    render(<Contact />);
    const msgInput = screen.getByPlaceholderText(/your message here/i);
    fireEvent.change(msgInput, { target: { value: 'Hello!', name: 'message' } });
    expect(msgInput).toHaveValue('Hello!');
  });

  it('shows success message after form submission', () => {
    jest.useFakeTimers();
    render(<Contact />);

    fireEvent.change(screen.getByPlaceholderText(/your name/i), {
      target: { value: 'Bob', name: 'name' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email\.com/i), {
      target: { value: 'bob@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByPlaceholderText(/what is this about/i), {
      target: { value: 'Tour inquiry', name: 'subject' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your message here/i), {
      target: { value: 'I am interested in your tours.', name: 'message' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form'));

    expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('resets the form and hides success message after 3 seconds', () => {
    jest.useFakeTimers();
    render(<Contact />);

    fireEvent.change(screen.getByPlaceholderText(/your name/i), {
      target: { value: 'Charlie', name: 'name' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your@email\.com/i), {
      target: { value: 'charlie@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByPlaceholderText(/what is this about/i), {
      target: { value: 'Hello', name: 'subject' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your message here/i), {
      target: { value: 'A message.', name: 'message' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form'));
    expect(screen.getByText(/thank you/i)).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(3000));

    // Success message disappears, form returns
    expect(screen.queryByText(/thank you/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('renders business hours', () => {
    render(<Contact />);
    expect(screen.getByText(/monday.*friday/i)).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: /facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument();
  });
});
