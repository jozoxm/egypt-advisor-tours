import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Tours from '../../pages/Tours';

const mockTours = [
  { id: 1, name: 'Pyramids Tour', price: 150 },
  { id: 2, name: 'Nile Cruise', price: 300 },
  { id: 3, name: 'Luxor Adventure', price: 200 },
  { id: 4, name: 'Aswan Experience', price: 100 },
];

describe('Tours', () => {
  it('renders all tours by default', () => {
    render(<Tours tours={mockTours} />);
    expect(screen.getByText(/Pyramids Tour/)).toBeInTheDocument();
    expect(screen.getByText(/Nile Cruise/)).toBeInTheDocument();
    expect(screen.getByText(/Luxor Adventure/)).toBeInTheDocument();
    expect(screen.getByText(/Aswan Experience/)).toBeInTheDocument();
  });

  it('renders tours sorted by price ascending by default', () => {
    render(<Tours tours={mockTours} />);
    const items = screen.getAllByRole('listitem');
    // Ascending: Aswan $100, Pyramids $150, Luxor $200, Nile $300
    expect(items[0]).toHaveTextContent('Aswan Experience');
    expect(items[1]).toHaveTextContent('Pyramids Tour');
    expect(items[2]).toHaveTextContent('Luxor Adventure');
    expect(items[3]).toHaveTextContent('Nile Cruise');
  });

  it('sorts tours by price descending when selected', async () => {
    render(<Tours tours={mockTours} />);
    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'desc' } });
    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      // Descending: Nile $300, Luxor $200, Pyramids $150, Aswan $100
      expect(items[0]).toHaveTextContent('Nile Cruise');
    });
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveTextContent('Luxor Adventure');
    expect(items[2]).toHaveTextContent('Pyramids Tour');
    expect(items[3]).toHaveTextContent('Aswan Experience');
  });

  it('filters tours by name', () => {
    render(<Tours tours={mockTours} />);
    const filterInput = screen.getByPlaceholderText(/filter by name/i);
    fireEvent.change(filterInput, { target: { value: 'nile' } });
    expect(screen.getByText(/Nile Cruise/)).toBeInTheDocument();
    expect(screen.queryByText(/Pyramids Tour/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Luxor Adventure/)).not.toBeInTheDocument();
  });

  it('filter is case-insensitive', () => {
    render(<Tours tours={mockTours} />);
    const filterInput = screen.getByPlaceholderText(/filter by name/i);
    fireEvent.change(filterInput, { target: { value: 'PYRAMIDS' } });
    expect(screen.getByText(/Pyramids Tour/)).toBeInTheDocument();
    expect(screen.queryByText(/Nile Cruise/)).not.toBeInTheDocument();
  });

  it('shows no tours when filter matches nothing', () => {
    render(<Tours tours={mockTours} />);
    const filterInput = screen.getByPlaceholderText(/filter by name/i);
    fireEvent.change(filterInput, { target: { value: 'xyz-no-match' } });
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('renders an empty list when no tours are provided', () => {
    render(<Tours tours={[]} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('renders price next to tour name', () => {
    render(<Tours tours={mockTours} />);
    expect(screen.getByText(/Pyramids Tour - \$150/)).toBeInTheDocument();
  });

  it('renders filter input and sort select', () => {
    render(<Tours tours={mockTours} />);
    expect(screen.getByPlaceholderText(/filter by name/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
