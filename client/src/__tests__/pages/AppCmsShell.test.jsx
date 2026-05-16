import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import { getAbout, getFaq, getFooter, getHomepage, getNavigation, getTailorTrip } from '../../api/cms';

jest.mock('../../hooks/useStoryblokPreview', () => jest.fn());
jest.mock('../../api/cms', () => ({
  getNavigation: jest.fn(),
  getFooter: jest.fn(),
  getHomepage: jest.fn(),
  getAbout: jest.fn(),
  getFaq: jest.fn(),
  getTailorTrip: jest.fn(),
}));

jest.mock('../../context/DataContext', () => ({
  useData: () => ({
    tours: [],
    testimonials: [],
    contactInfo: {
      companyName: 'Egypt Advisor Tours',
      companyTagline: 'Fallback tagline',
      emailPrimary: 'info@egyptadvisortours.com',
      phone: '+20 (123) 456-7890',
      address: { fullAddress: 'Cairo, Egypt' },
      socialMedia: { facebook: '#', instagram: '#', twitter: '#' },
    },
    blogs: [],
    siteSettings: {
      hero: {
        badge: 'Badge',
        title: 'Title',
        subtitle: 'Subtitle',
        primaryButtonText: 'Explore',
        secondaryButtonText: 'Plan',
      },
      stats: [],
    },
    loading: { tours: false },
  }),
}));

describe('App CMS shell fallback', () => {
  beforeEach(() => {
    getHomepage.mockRejectedValue(new Error('offline'));
    getAbout.mockRejectedValue(new Error('offline'));
    getFaq.mockRejectedValue(new Error('offline'));
    getTailorTrip.mockRejectedValue(new Error('offline'));
    getNavigation.mockRejectedValue(new Error('offline'));
    getFooter.mockRejectedValue(new Error('offline'));
  });

  it('renders fallback navigation/footer content when CMS endpoints fail', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /faq/i })).toHaveAttribute('href', '/faq');
    expect(screen.getByText(/your trusted partner in discovering the wonders of ancient egypt/i)).toBeInTheDocument();
  });
});
