import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookingModal from '../../components/BookingModal';

// Mock @emailjs/browser
jest.mock('@emailjs/browser', () => ({
  send: jest.fn(),
}));

import emailjs from '@emailjs/browser';

const mockTourWithPrices = {
  id: 1,
  name: 'Pyramids & Sphinx Tour',
  image: '🏛️',
  prices: {
    individual: '$150',
    group: '$120',
    sharing: '$90',
  },
};

const mockTourWithSimplePrice = {
  id: 2,
  name: 'Nile Cruise',
  image: '🚢',
  price: '$200',
};

const onClose = jest.fn();

const renderModal = (tour = mockTourWithPrices) =>
  render(<BookingModal tour={tour} onClose={onClose} />);

describe('BookingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the tour name in the header', () => {
    renderModal();
    expect(screen.getByText(`Book: ${mockTourWithPrices.name}`)).toBeInTheDocument();
  });

  it('renders the tour icon', () => {
    renderModal();
    expect(screen.getByText(mockTourWithPrices.image)).toBeInTheDocument();
  });

  it('renders a close button', () => {
    renderModal();
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    const { container } = renderModal();
    fireEvent.click(container.querySelector('.booking-modal-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when modal content is clicked', () => {
    const { container } = renderModal();
    fireEvent.click(container.querySelector('.booking-modal-content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders price category dropdown for tour with prices', () => {
    renderModal(mockTourWithPrices);
    expect(screen.getByLabelText(/price category/i)).toBeInTheDocument();
  });

  it('does not render price category dropdown for tour with simple price', () => {
    renderModal(mockTourWithSimplePrice);
    expect(screen.queryByLabelText(/price category/i)).not.toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    renderModal();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of people/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred time/i)).toBeInTheDocument();
  });

  it('renders confirm booking and cancel buttons', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /confirm booking/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('cancel button calls onClose', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('updates form fields on user input', () => {
    renderModal();
    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { name: 'customerName', value: 'Jane Smith' } });
    expect(nameInput).toHaveValue('Jane Smith');
  });

  it('shows the total price calculation in the summary', () => {
    renderModal(mockTourWithPrices);
    // Default is individual at $150 × 1 person
    expect(screen.getByText('$150')).toBeInTheDocument();
  });

  it('shows the total price for a tour with a simple price', () => {
    renderModal(mockTourWithSimplePrice);
    // Multiple elements may contain "$200"; verify at least one exists
    expect(screen.getAllByText(/\$200/).length).toBeGreaterThan(0);
  });

  it('shows an error message when EmailJS is not configured', async () => {
    // In the test environment REACT_APP_EMAILJS_* env vars are unset,
    // so the component falls into the "unavailable" branch on submit.
    renderModal();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { name: 'customerName', value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { name: 'customerEmail', value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { name: 'customerPhone', value: '+1-555-9999' },
    });
    fireEvent.change(screen.getByLabelText(/preferred date/i), {
      target: { name: 'bookingDate', value: '2025-06-01' },
    });

    fireEvent.submit(screen.getByRole('button', { name: /confirm booking/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('alert').textContent).toMatch(/contact/i);
  });

  it('shows an unavailable message (EmailJS not configured) rather than calling emailjs.send', async () => {
    // Because env vars are module-level constants, emailjs.send is never
    // invoked when the service ID is empty.
    renderModal();

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { name: 'customerName', value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { name: 'customerEmail', value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { name: 'customerPhone', value: '+1-555-0000' },
    });
    fireEvent.change(screen.getByLabelText(/preferred date/i), {
      target: { name: 'bookingDate', value: '2025-07-01' },
    });

    fireEvent.submit(
      screen.getByRole('button', { name: /confirm booking/i }).closest('form')
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    // emailjs.send should NOT have been called because the keys are empty
    expect(emailjs.send).not.toHaveBeenCalled();
  });
});
