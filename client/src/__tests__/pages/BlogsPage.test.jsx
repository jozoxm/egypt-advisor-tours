import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BlogsPage from '../../pages/BlogsPage';

const mockBlogs = [
  {
    id: 1,
    image: '🏛️',
    category: 'History',
    date: '2024-03-15',
    title: 'Secrets of the Pyramids',
    excerpt: 'Discover the hidden chambers of the Giza pyramids.',
    author: 'Dr. Ahmed Hassan',
  },
  {
    id: 2,
    image: '🌊',
    category: 'Adventure',
    date: '2024-04-01',
    title: 'Nile River Journey',
    excerpt: 'A week-long cruise down the Nile.',
    author: 'Sara Khalil',
  },
  {
    id: 3,
    image: '🐪',
    category: 'Culture',
    date: 'not-a-date',
    title: 'Desert Safari Guide',
    excerpt: 'Everything you need to know about desert safaris.',
    author: 'Omar Faris',
  },
];

describe('BlogsPage', () => {
  it('renders the section heading', () => {
    render(<BlogsPage blogs={mockBlogs} />);
    expect(screen.getByRole('heading', { name: /travel insights.*blogs/i })).toBeInTheDocument();
  });

  it('renders all blog cards', () => {
    render(<BlogsPage blogs={mockBlogs} />);
    expect(screen.getByText('Secrets of the Pyramids')).toBeInTheDocument();
    expect(screen.getByText('Nile River Journey')).toBeInTheDocument();
    expect(screen.getByText('Desert Safari Guide')).toBeInTheDocument();
  });

  it('renders blog category and author', () => {
    render(<BlogsPage blogs={mockBlogs} />);
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText(/Dr. Ahmed Hassan/)).toBeInTheDocument();
  });

  it('renders blog excerpt', () => {
    render(<BlogsPage blogs={mockBlogs} />);
    expect(
      screen.getByText('Discover the hidden chambers of the Giza pyramids.')
    ).toBeInTheDocument();
  });

  it('renders formatted date for valid date string', () => {
    render(<BlogsPage blogs={mockBlogs} />);
    // 2024-03-15 → "Mar 15, 2024"
    expect(screen.getByText(/mar 15, 2024/i)).toBeInTheDocument();
  });

  it('renders "Date unavailable" for an invalid date string', () => {
    render(<BlogsPage blogs={mockBlogs} />);
    expect(screen.getByText('Date unavailable')).toBeInTheDocument();
  });

  it('renders the "Tailor a trip" button for each blog', () => {
    render(<BlogsPage blogs={mockBlogs} />);
    const buttons = screen.getAllByRole('button', { name: /tailor a trip/i });
    expect(buttons).toHaveLength(mockBlogs.length);
  });

  it('calls onTailorTrip when a blog button is clicked', () => {
    const onTailorTrip = jest.fn();
    render(<BlogsPage blogs={mockBlogs} onTailorTrip={onTailorTrip} />);
    const buttons = screen.getAllByRole('button', { name: /tailor a trip/i });
    fireEvent.click(buttons[0]);
    expect(onTailorTrip).toHaveBeenCalledTimes(1);
  });

  it('renders with empty blogs array showing no cards', () => {
    render(<BlogsPage blogs={[]} />);
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('sets the document title to "Travel Blogs | Egypt Advisor Tours"', () => {
    render(<BlogsPage blogs={[]} />);
    expect(document.title).toBe('Travel Blogs | Egypt Advisor Tours');
  });

  it('uses the default blogs data when no blogs prop is provided', () => {
    render(<BlogsPage />);
    // Default blogs data should have at least one blog
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });
});
