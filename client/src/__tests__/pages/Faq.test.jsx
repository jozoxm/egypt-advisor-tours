import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Faq from '../../pages/Faq';

describe('Faq', () => {
  it('renders fallback title and intro', () => {
    render(<Faq onTailorTrip={jest.fn()} />);
    expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument();
    expect(screen.getByText(/everything you need to know/i)).toBeInTheDocument();
  });

  it('toggles an accordion answer', () => {
    render(<Faq onTailorTrip={jest.fn()} />);
    const question = screen.getByRole('button', { name: /how far in advance should i book/i });
    expect(screen.queryByText(/2–6 weeks/i)).not.toBeInTheDocument();
    fireEvent.click(question);
    expect(screen.getByText(/2–6 weeks/i)).toBeInTheDocument();
  });

  it('fires tailor-trip callback from contact CTA', () => {
    const onTailorTrip = jest.fn();
    render(<Faq onTailorTrip={onTailorTrip} />);
    fireEvent.click(screen.getByRole('button', { name: /tailor my trip/i }));
    expect(onTailorTrip).toHaveBeenCalledTimes(1);
  });
});

