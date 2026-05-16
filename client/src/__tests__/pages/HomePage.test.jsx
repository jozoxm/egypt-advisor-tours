import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import { getHomepage } from '../../api/cms';

jest.mock('../../api/cms', () => ({
  getHomepage: jest.fn(),
}));

jest.mock('../../pages/ToursSection', () => ({ heading }) => <div data-testid="tours-section-heading">{heading}</div>);

const defaultProps = {
  siteSettings: {
    hero: {
      badge: 'Fallback badge',
      title: 'Fallback title',
      subtitle: 'Fallback subtitle',
      primaryButtonText: 'Explore Tours',
      secondaryButtonText: 'Plan My Trip',
    },
    stats: [{ value: '1', label: 'Fallback stat' }],
  },
  filteredTours: [],
  tourSearch: '',
  setTourSearch: jest.fn(),
  totalTours: 0,
  toursLoading: false,
  blogs: [],
  testimonials: [],
  goToSection: jest.fn(),
  onTailorTrip: jest.fn(),
};

describe('HomePage', () => {
  beforeEach(() => {
    getHomepage.mockRejectedValue(new Error('offline'));
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderHome = (props = {}) => render(
    <MemoryRouter>
      <HomePage {...defaultProps} {...props} />
    </MemoryRouter>
  );

  it('renders the hero slideshow', () => {
    renderHome();
    expect(document.querySelector('.hero-slideshow')).toBeInTheDocument();
  });

  it('renders fallback hero values when CMS is unavailable', () => {
    renderHome();
    expect(screen.getByText(/premium travel experiences/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /discover the wonders of ancient egypt/i })).toBeInTheDocument();
    expect(screen.getByText(/embark on an unforgettable journey/i)).toBeInTheDocument();
  });

  it('renders CMS hero/highlights/featured heading when API succeeds', async () => {
    getHomepage.mockResolvedValueOnce({
      hero: {
        badge: 'CMS badge',
        title: 'CMS title',
        subtitle: 'CMS subtitle',
        primaryButtonText: 'CMS primary',
        secondaryButtonText: 'CMS secondary',
      },
      highlights: [{ value: '999', label: 'CMS stat' }],
      featuredSectionTitle: 'CMS featured section',
    });

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/cms badge/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /cms title/i })).toBeInTheDocument();
    expect(screen.getByText(/cms subtitle/i)).toBeInTheDocument();
    expect(screen.getByText(/cms stat/i)).toBeInTheDocument();
    expect(screen.getByTestId('tours-section-heading')).toHaveTextContent('CMS featured section');
  });
});
