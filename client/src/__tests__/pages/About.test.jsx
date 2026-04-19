import React from 'react';
import { render, screen } from '@testing-library/react';
import About from '../../pages/About';

describe('About', () => {
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
});
