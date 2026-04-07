import React from 'react';
import ToursSection from './ToursSection';

const ToursPage = ({
  filteredTours,
  tourSearch,
  setTourSearch,
  totalTours,
  toursLoading,
  onTailorTrip,
  goToSection,
}) => (
  <>
    <section className="hero tours-hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <span className="hero-tag">🧭 Explore Egypt</span>
        <h1>All Tours &amp; Experiences</h1>
        <p>Dive into our full collection of curated adventures across Cairo, Luxor, Aswan, the Nile, and beyond.</p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => goToSection('tours')}>
            View Tours
          </button>
          <button className="btn btn-secondary" onClick={onTailorTrip}>
            Tailor My Trip
          </button>
        </div>
      </div>
    </section>

    <ToursSection
      filteredTours={filteredTours}
      tourSearch={tourSearch}
      setTourSearch={setTourSearch}
      totalTours={totalTours}
      toursLoading={toursLoading}
      heading="All Egypt Tours"
      subheading="Browse every signature experience and choose the adventure that fits you best."
    />
  </>
);

export default ToursPage;
