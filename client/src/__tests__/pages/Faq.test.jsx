import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Faq from '../../pages/Faq';
import { getFaq } from '../../api/cms';

jest.mock('../../api/cms', () => ({
  getFaq: jest.fn(),
}));

describe('Faq', () => {
  beforeEach(() => {
    getFaq.mockRejectedValue(new Error('offline'));
  });

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

  it('renders CMS FAQ categories and CTA when API succeeds', async () => {
    const onTailorTrip = jest.fn();
    getFaq.mockResolvedValueOnce({
      pageTitle: 'CMS FAQ',
      pageIntro: 'CMS intro',
      categories: [
        {
          title: 'CMS Category',
          items: [{ question: 'CMS Q1?', answer: 'CMS A1' }],
        },
      ],
      contactCta: {
        title: 'Need help?',
        description: 'CMS CTA description',
        actionLabel: 'Open Tailor',
        action: 'open-tailor-trip-modal',
      },
    });

    render(<Faq onTailorTrip={onTailorTrip} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /cms faq/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /cms q1\?/i }));
    expect(screen.getByText(/cms a1/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /open tailor/i }));
    expect(onTailorTrip).toHaveBeenCalledTimes(1);
  });
});
