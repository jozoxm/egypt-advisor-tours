import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TourCardSkeleton from '../components/TourCardSkeleton';

const TOURS_PER_PAGE = 6;

const ToursSection = ({
  filteredTours,
  tourSearch,
  setTourSearch,
  totalTours,
  toursLoading = false,
  heading = 'Signature Experiences',
  subheading = "Carefully curated tours designed to showcase Egypt's most breathtaking destinations"
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Reset to page 1 whenever the filtered list changes (e.g. after a search)
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTours]);

  const totalPages = Math.ceil(filteredTours.length / TOURS_PER_PAGE);
  const startIndex = (currentPage - 1) * TOURS_PER_PAGE;
  const paginatedTours = filteredTours.slice(startIndex, startIndex + TOURS_PER_PAGE);

  // Build a compact list of page numbers to show (always show first, last, current ±1)
  const getPageNumbers = () => {
    const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    return [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  };

  return (
    <section id="tours" className="tours">
      <div className="section-header">
        <h2>{heading}</h2>
        <p>{subheading}</p>
      </div>

      <div className="tours-toolbar">
        <div className="search-input">
          <input
            type="search"
            value={tourSearch}
            onChange={(e) => setTourSearch(e.target.value)}
            placeholder="Search tours by name, duration, or experience (e.g., Nile, pyramids, Luxor)"
            aria-label="Search tours"
          />
          {tourSearch && (
            <button className="clear-search" onClick={() => setTourSearch('')}>
              Clear
            </button>
          )}
        </div>
        <div className="tours-count">
          Showing {startIndex + 1}–{Math.min(startIndex + TOURS_PER_PAGE, filteredTours.length)} of {filteredTours.length} tours
        </div>
      </div>

      {toursLoading ? (
        <div className="tours-grid">
          {Array.from({ length: TOURS_PER_PAGE }).map((_, i) => (
            <TourCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="empty-state">
          <p>No tours match that search yet.</p>
          <button className="btn btn-primary" onClick={() => setTourSearch('')}>
            Show all tours
          </button>
        </div>
      ) : (
        <>
          <div className="tours-grid">
            {paginatedTours.map(tour => (
              <div
                key={tour.id}
                className="tour-card"
                onClick={() => navigate(`/tours/${tour.id}`)}
              >
                <div
                  className="tour-image-wrapper"
                  style={tour.photoUrl ? { backgroundImage: `url("${tour.photoUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!tour.photoUrl && <div className="tour-icon">{tour.image}</div>}
                  <div className="tour-overlay">
                    <button className="explore-btn">View Details</button>
                  </div>
                </div>
                <div className="tour-content">
                  <h3>{tour.name}</h3>
                  <div className="tour-rating">
                    <span className="stars">{'⭐'.repeat(Math.floor(tour.rating))}</span>
                    <span className="rating-text">({tour.reviews} reviews)</span>
                  </div>
                  <p className="tour-description">{tour.description}</p>
                  <div className="tour-details">
                    <span className="detail">⏱️ {tour.duration}</span>
                    <span className="detail">👥 {tour.groupSize}</span>
                  </div>
                  <div className="tour-footer">
                    <span className="price">From {tour.prices ? tour.prices.sharing : tour.price}</span>
                    <button
                      className="book-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tours/${tour.id}`);
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn pagination-prev"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ← Prev
              </button>

              <div className="pagination-pages">
                {getPageNumbers().map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="pagination-ellipsis">…</span>
                    )}
                    <button
                      className={`pagination-btn${currentPage === page ? ' active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              <button
                className="pagination-btn pagination-next"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ToursSection;
