import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ToursSection from '../../pages/ToursSection';

const makeTour = (id, name, rating = 4.5, reviews = 100) => ({
  id,
  name,
  description: `Description for ${name}`,
  duration: '4 hours',
  groupSize: 'Up to 12',
  rating,
  reviews,
  image: '🏛️',
  photoUrl: '',
  prices: { individual: '$100', group: '$80', sharing: '$60' },
});

const manyTours = Array.from({ length: 15 }, (_, i) =>
  makeTour(i + 1, `Tour ${i + 1}`)
);

const fewTours = [
  makeTour(1, 'Pyramids Tour'),
  makeTour(2, 'Nile Cruise'),
  makeTour(3, 'Luxor Adventure'),
];

const renderSection = (props = {}) =>
  render(
    <MemoryRouter>
      <ToursSection
        filteredTours={fewTours}
        tourSearch=""
        setTourSearch={jest.fn()}
        totalTours={fewTours.length}
        toursLoading={false}
        {...props}
      />
    </MemoryRouter>
  );

describe('ToursSection', () => {
  it('renders the default heading', () => {
    renderSection();
    expect(
      screen.getByRole('heading', { name: /signature experiences/i })
    ).toBeInTheDocument();
  });

  it('renders a custom heading', () => {
    renderSection({ heading: 'All Egypt Tours' });
    expect(screen.getByRole('heading', { name: /all egypt tours/i })).toBeInTheDocument();
  });

  it('renders all tour cards', () => {
    renderSection();
    expect(screen.getByText('Pyramids Tour')).toBeInTheDocument();
    expect(screen.getByText('Nile Cruise')).toBeInTheDocument();
    expect(screen.getByText('Luxor Adventure')).toBeInTheDocument();
  });

  it('shows skeleton placeholders when loading', () => {
    renderSection({ toursLoading: true });
    // TourCardSkeleton elements have aria-hidden="true"
    const skeletons = document.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows an empty state when no tours match the search', () => {
    renderSection({ filteredTours: [] });
    expect(screen.getByText(/no tours match/i)).toBeInTheDocument();
  });

  it('calls setTourSearch with empty string when "Show all tours" is clicked', () => {
    const setTourSearch = jest.fn();
    renderSection({ filteredTours: [], setTourSearch });
    fireEvent.click(screen.getByRole('button', { name: /show all tours/i }));
    expect(setTourSearch).toHaveBeenCalledWith('');
  });

  it('renders a search input', () => {
    renderSection();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('calls setTourSearch when search input changes', () => {
    const setTourSearch = jest.fn();
    renderSection({ setTourSearch });
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'pyramid' } });
    expect(setTourSearch).toHaveBeenCalledWith('pyramid');
  });

  it('shows a clear button when search has a value', () => {
    renderSection({ tourSearch: 'nile' });
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('calls setTourSearch with empty string when clear button is clicked', () => {
    const setTourSearch = jest.fn();
    renderSection({ tourSearch: 'nile', setTourSearch });
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(setTourSearch).toHaveBeenCalledWith('');
  });

  it('does not show a clear button when search is empty', () => {
    renderSection({ tourSearch: '' });
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('renders pagination when tours exceed TOURS_PER_PAGE (6)', () => {
    render(
      <MemoryRouter>
        <ToursSection
          filteredTours={manyTours}
          tourSearch=""
          setTourSearch={jest.fn()}
          totalTours={manyTours.length}
          toursLoading={false}
        />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
  });

  it('prev button is disabled on first page', () => {
    render(
      <MemoryRouter>
        <ToursSection
          filteredTours={manyTours}
          tourSearch=""
          setTourSearch={jest.fn()}
          totalTours={manyTours.length}
          toursLoading={false}
        />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/previous page/i)).toBeDisabled();
  });

  it('navigates to the next page when next button is clicked', () => {
    render(
      <MemoryRouter>
        <ToursSection
          filteredTours={manyTours}
          tourSearch=""
          setTourSearch={jest.fn()}
          totalTours={manyTours.length}
          toursLoading={false}
        />
      </MemoryRouter>
    );
    // First page shows Tours 1-6; click next
    fireEvent.click(screen.getByLabelText(/next page/i));
    // Second page shows Tours 7-12
    expect(screen.getByText('Tour 7')).toBeInTheDocument();
    expect(screen.queryByText('Tour 1')).not.toBeInTheDocument();
  });

  it('shows tours count text', () => {
    renderSection();
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
  });
});
