import React from 'react';
import { render, screen } from '@testing-library/react';
import TourCard from '../../components/TourCard';

const defaultProps = {
  image: 'https://example.com/tour.jpg',
  title: 'Pyramids Tour',
  description: 'Explore the ancient pyramids of Giza',
  duration: '8 hours',
  price: 150,
  rating: 4.8,
};

describe('TourCard', () => {
  it('renders the tour image with correct src and alt', () => {
    render(<TourCard {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', defaultProps.image);
    expect(img).toHaveAttribute('alt', defaultProps.title);
  });

  it('renders the tour title', () => {
    render(<TourCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });

  it('renders the tour description', () => {
    render(<TourCard {...defaultProps} />);
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
  });

  it('renders the duration', () => {
    render(<TourCard {...defaultProps} />);
    expect(screen.getByText(`Duration: ${defaultProps.duration}`)).toBeInTheDocument();
  });

  it('renders the price', () => {
    render(<TourCard {...defaultProps} />);
    expect(screen.getByText(`Price: $${defaultProps.price}`)).toBeInTheDocument();
  });

  it('renders the rating', () => {
    render(<TourCard {...defaultProps} />);
    expect(screen.getByText(`Rating: ${defaultProps.rating} ⭐`)).toBeInTheDocument();
  });

  it('renders a Book Now button', () => {
    render(<TourCard {...defaultProps} />);
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  it('renders with lazy loading on the image', () => {
    render(<TourCard {...defaultProps} />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });
});
