import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TailorTripModal from '../../components/TailorTripModal';
import { getTailorTrip } from '../../api/cms';

jest.mock('../../api/cms', () => ({
  getTailorTrip: jest.fn(),
}));

describe('TailorTripModal CMS wiring', () => {
  const contactInfo = {
    emailPrimary: 'info@example.com',
    phone: '+20 111 222 333',
  };

  beforeEach(() => {
    getTailorTrip.mockRejectedValue(new Error('offline'));
  });

  it('renders fallback labels/placeholders when CMS is unavailable', () => {
    render(<TailorTripModal isOpen onClose={jest.fn()} contactInfo={contactInfo} />);
    expect(screen.getByRole('heading', { name: /tailor your egypt journey/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/travel style/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/preferred travel dates/i)).toBeInTheDocument();
  });

  it('renders CMS labels/options/content when API succeeds', async () => {
    getTailorTrip.mockResolvedValueOnce({
      hero: {
        title: 'CMS Tailor Hero',
        subtitle: 'CMS Tailor Subtitle',
      },
      form: {
        title: 'CMS Form Title',
        submitLabel: 'CMS Submit',
        fields: {
          accommodation: {
            label: 'CMS Accommodation',
            placeholder: 'CMS accommodation placeholder',
            options: [
              { value: 'lux', label: 'Luxury CMS' },
            ],
          },
          pace: {
            label: 'CMS Pace',
            placeholder: 'CMS pace placeholder',
            options: [{ value: 'relaxed', label: 'Relaxed CMS' }],
          },
          budget: {
            label: 'CMS Budget',
            placeholder: 'CMS budget placeholder',
            options: [{ value: 'premium', label: 'Premium CMS' }],
          },
          language: {
            label: 'CMS Language',
            placeholder: 'CMS language placeholder',
            options: [{ value: 'english', label: 'English CMS' }],
          },
          interests: {
            label: 'CMS Interests Label',
            options: ['CMS Interest One', 'CMS Interest Two'],
          },
          whatsapp: {
            label: 'WhatsApp CMS',
          },
        },
      },
    });

    render(<TailorTripModal isOpen onClose={jest.fn()} contactInfo={contactInfo} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /cms tailor hero/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/cms form title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cms accommodation/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /luxury cms/i })).toBeInTheDocument();
    expect(screen.getByText(/cms interests label/i)).toBeInTheDocument();
    expect(screen.getByText(/cms interest one/i)).toBeInTheDocument();
    expect(screen.getByText(/whatsapp cms/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cms submit/i })).toBeInTheDocument();
  });
});

