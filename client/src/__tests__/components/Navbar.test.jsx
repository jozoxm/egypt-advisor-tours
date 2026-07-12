import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const renderNavbar = () =>
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );

describe('Navbar', () => {
  it('renders the logo image', () => {
    renderNavbar();
    const logo = screen.getByAltText('Egypt Advisor Tours');
    expect(logo).toBeInTheDocument();
    expect(logo.tagName).toBe('IMG');
  });

  it('renders the Home nav link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '/');
  });

  it('renders the Tours nav link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /^tours$/i })).toHaveAttribute('href', '/tours');
  });

  it('renders the Blogs nav link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /^blogs$/i })).toHaveAttribute('href', '/blogs');
  });

  it('renders the About nav link', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: /^about$/i })).toHaveAttribute('href', '/about');
  });

  it('renders a nav element', () => {
    renderNavbar();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
