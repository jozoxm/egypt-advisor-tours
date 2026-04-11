import React from 'react';
import { render, screen } from '@testing-library/react';
import TourCardSkeleton from '../../components/TourCardSkeleton';

describe('TourCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<TourCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has aria-hidden attribute to hide from screen readers', () => {
    const { container } = render(<TourCardSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('has the skeleton-card CSS class', () => {
    const { container } = render(<TourCardSkeleton />);
    expect(container.firstChild).toHaveClass('skeleton-card');
  });

  it('renders the skeleton image placeholder', () => {
    const { container } = render(<TourCardSkeleton />);
    expect(container.querySelector('.skeleton-image')).toBeInTheDocument();
  });

  it('renders multiple skeleton lines', () => {
    const { container } = render(<TourCardSkeleton />);
    const skeletonLines = container.querySelectorAll('.skeleton-line');
    expect(skeletonLines.length).toBeGreaterThanOrEqual(4);
  });

  it('renders without any visible text content', () => {
    const { container } = render(<TourCardSkeleton />);
    expect(container.firstChild.textContent).toBe('');
  });
});
