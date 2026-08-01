import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import About from '../../pages/About';
import { getAbout } from '../../api/cms';

jest.mock('../../api/cms', () => ({
  getAbout: jest.fn(),
}));

describe('About', () => {
  beforeEach(() => {
    getAbout.mockRejectedValue(new Error('offline'));
  });

  it('renders the main heading', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /why egypt advisor/i })).toBeInTheDocument();
  });

  it('renders the intro text', () => {
    render(<About />);
    expect(screen.getByText(/gateway to authentic Egyptian experiences/i)).toBeInTheDocument();
  });

  it('renders all six feature cards', () => {
    render(<About />);
    const features = [
      /expert guides/i,
      /safety.*comfort/i,
      /exclusive access/i,
      /personalized service/i,
      /best value/i,
      /24\/7 support/i,
    ];
    features.forEach((feature) => {
      expect(screen.getByRole('heading', { name: feature })).toBeInTheDocument();
    });
  });

  it('renders feature icons', () => {
    render(<About />);
    expect(screen.getByText('🎓')).toBeInTheDocument();
    expect(screen.getByText('🛡️')).toBeInTheDocument();
    expect(screen.getByText('💎')).toBeInTheDocument();
  });

  it('sets the document title to "About Us | Egypt Advisor Tours"', () => {
    render(<About />);
    expect(document.title).toBe('About Us | Egypt Advisor Tours');
  });

  it('renders CMS about content when API succeeds', async () => {
    getAbout.mockResolvedValueOnce({
      pageTitle: 'About CMS Title',
      intro: 'About CMS intro text',
      sections: [{ icon: '🧭', title: 'CMS Section', body: 'CMS section body' }],
    });

    render(<About />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /about cms title/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/about cms intro text/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /cms section/i })).toBeInTheDocument();
  });
});
