import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../../components/Footer';

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

describe('Footer', () => {
  it('renders the company name', () => {
    renderFooter();
    expect(screen.getByText('Egypt Advisor Tours')).toBeInTheDocument();
  });

  it('renders the Home link', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '/');
  });

  it('renders the Tours link', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /^tours$/i })).toHaveAttribute('href', '/tours');
  });

  it('renders the Blogs link', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /^blogs$/i })).toHaveAttribute('href', '/blogs');
  });

  it('renders the About Us link', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /about us/i })).toHaveAttribute('href', '/about');
  });

  it('renders contact information', () => {
    renderFooter();
    expect(screen.getByText(/info@egyptadvisortours\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/\+20/)).toBeInTheDocument();
    expect(screen.getByText(/Cairo, Egypt/i)).toBeInTheDocument();
  });

  it('renders the copyright notice with the current year', () => {
    renderFooter();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('renders social media buttons', () => {
    renderFooter();
    expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /instagram/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument();
  });
});
