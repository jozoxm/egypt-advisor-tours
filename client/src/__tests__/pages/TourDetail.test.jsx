import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TourDetail from '../../pages/TourDetail';

// Silence fetch errors from test environment
const originalFetch = global.fetch;
global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

afterAll(() => {
  global.fetch = originalFetch;
});

const mockTour = {
  id: 42,
  name: 'Valley of the Kings',
  description: 'Explore the ancient royal tombs.',
  duration: '6 hours',
  groupSize: 'Up to 10',
  rating: 4.9,
  reviews: 215,
  image: '🏛️',
  photoUrl: '',
  prices: {
    individual: '$180',
    group: '$140',
    sharing: '$100',
  },
  itinerary: [
    { day: 1, time: '09:00 AM', title: 'Arrival', description: 'Meet your guide.' },
    { day: 1, time: '10:00 AM', title: 'Tomb of Ramesses', description: 'Explore the tomb.' },
  ],
};

// Mock the tours-data module so we control the tour list
jest.mock('../../data/tours-data', () => ({
  tours: [
    {
      id: 42,
      name: 'Valley of the Kings',
      description: 'Explore the ancient royal tombs.',
      duration: '6 hours',
      groupSize: 'Up to 10',
      rating: 4.9,
      reviews: 215,
      image: '🏛️',
      photoUrl: '',
      prices: { individual: '$180', group: '$140', sharing: '$100' },
      itinerary: [
        { day: 1, time: '09:00 AM', title: 'Arrival', description: 'Meet your guide.' },
        { day: 1, time: '10:00 AM', title: 'Tomb of Ramesses', description: 'Explore the tomb.' },
      ],
    },
  ],
}));

const renderWithRouter = (id) =>
  render(
    <MemoryRouter initialEntries={[`/tours/${id}`]}>
      <Routes>
        <Route path="/tours/:id" element={<TourDetail />} />
        <Route path="/tours" element={<div>Tours Page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('TourDetail', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockImplementation(() => Promise.resolve({ ok: false }));
  });

  it('renders the tour name for a valid tour ID', async () => {
    renderWithRouter(42);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /valley of the kings/i })).toBeInTheDocument();
    });
  });

  it('renders tour description', async () => {
    renderWithRouter(42);
    await waitFor(() => {
      expect(screen.getByText(/explore the ancient royal tombs/i)).toBeInTheDocument();
    });
  });

  it('renders the duration', async () => {
    renderWithRouter(42);
    await waitFor(() => {
      expect(screen.getAllByText(/6 hours/i).length).toBeGreaterThan(0);
    });
  });

  it('renders the rating', async () => {
    renderWithRouter(42);
    await waitFor(() => {
      expect(screen.getByText(/4\.9 \/ 5/i)).toBeInTheDocument();
    });
  });

  it('renders itinerary steps', async () => {
    renderWithRouter(42);
    await waitFor(() => {
      expect(screen.getByText('Arrival')).toBeInTheDocument();
      expect(screen.getByText('Tomb of Ramesses')).toBeInTheDocument();
    });
  });

  it('renders pricing options', async () => {
    renderWithRouter(42);
    await waitFor(() => {
      expect(screen.getByText(/\$180/)).toBeInTheDocument();
      expect(screen.getByText(/\$140/)).toBeInTheDocument();
      expect(screen.getByText(/\$100/)).toBeInTheDocument();
    });
  });

  it('renders a Book This Tour button', async () => {
    renderWithRouter(42);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /book this tour/i })).toBeInTheDocument();
    });
  });

  it('opens the booking modal when Book This Tour is clicked', async () => {
    renderWithRouter(42);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /book this tour/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /book this tour/i }));
    expect(screen.getByText(/book: valley of the kings/i)).toBeInTheDocument();
  });

  it('closes the booking modal when close button is clicked', async () => {
    renderWithRouter(42);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /book this tour/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /book this tour/i }));
    fireEvent.click(screen.getByRole('button', { name: 'X' }));
    expect(screen.queryByText(/book: valley of the kings/i)).not.toBeInTheDocument();
  });

  it('shows a not-found message for an unknown tour ID', async () => {
    renderWithRouter(9999);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /tour not found/i })).toBeInTheDocument();
    });
  });

  it('shows a back-to-tours button when tour is not found', async () => {
    renderWithRouter(9999);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to all tours/i })).toBeInTheDocument();
    });
  });

  it('navigates back to tours when "Back to All Tours" is clicked', async () => {
    renderWithRouter(9999);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /back to all tours/i })).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: /back to all tours/i }));
    expect(screen.getByText('Tours Page')).toBeInTheDocument();
  });

  it('sets the document title to the tour name', async () => {
    renderWithRouter(42);
    await waitFor(() => {
      expect(document.title).toMatch(/valley of the kings/i);
    });
  });
});
