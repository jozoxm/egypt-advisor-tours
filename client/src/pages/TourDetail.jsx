import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import { tours as defaultTours } from '../data/tours-data';
import useTitle from '../hooks/useTitle';
import './TourDetail.css';

const API_URL = process.env.REACT_APP_API_URL || '';

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tours, setTours] = useState(defaultTours);
  const [bookingTour, setBookingTour] = useState(null);

  const tour = tours.find((t) => t.id === parseInt(id, 10));
  useTitle(tour ? tour.name : 'Tour');

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_URL}/api/tours`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || !data.tours) return;
        setTours(data.tours);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  if (!tour) {
    return (
      <div className="tour-detail-page">
        <div className="tour-not-found">
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏛️</div>
          <h2>Tour Not Found</h2>
          <p>We couldn't find a tour with that ID. It may have been removed or the link is incorrect.</p>
          <button className="btn-back-tours" onClick={() => navigate('/tours')}>
            ← Back to All Tours
          </button>
        </div>
      </div>
    );
  }

  const heroStyle = tour.photoUrl
    ? { backgroundImage: `url("${tour.photoUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div className="tour-detail-page">
      {/* Hero Banner */}
      <div className="tour-detail-hero">
        <div className="tour-detail-hero-bg" style={heroStyle} />
        <div className="tour-detail-hero-overlay" />
        <div className="tour-detail-hero-content">
          <button className="tour-detail-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>{tour.name}</h1>
          <div className="tour-detail-hero-meta">
            <div className="meta-item meta-rating">
              <span className="stars">{'⭐'.repeat(Math.floor(tour.rating))}</span>
              <span className="reviews-count">({tour.reviews} reviews)</span>
            </div>
            <div className="meta-item">⏱️ {tour.duration}</div>
            <div className="meta-item">👥 {tour.groupSize}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="tour-detail-body">
        {/* Left – details */}
        <div className="tour-detail-main">
          {/* Description */}
          <div className="tour-detail-section">
            <h2>About This Tour</h2>
            <p className="tour-detail-description">{tour.description}</p>
          </div>

          {/* Itinerary */}
          {tour.itinerary && tour.itinerary.length > 0 && (() => {
            // Group steps by day number
            const days = tour.itinerary.reduce((acc, step) => {
              const d = step.day || 1;
              if (!acc[d]) acc[d] = [];
              acc[d].push(step);
              return acc;
            }, {});
            const dayKeys = Object.keys(days).map(Number).sort((a, b) => a - b);
            const isMultiDay = dayKeys.length > 1;
            return (
              <div className="tour-detail-section">
                <h2>Tour Itinerary</h2>
                {dayKeys.map((day) => (
                  <div key={day} className="itinerary-day">
                    {isMultiDay && (
                      <div className="itinerary-day-header">
                        <span className="itinerary-day-badge">Day {day}</span>
                      </div>
                    )}
                    <ol className="itinerary-steps">
                      {days[day].map((step, idx) => (
                        <li key={`${day}-${idx}`} className="itinerary-step">
                          <div className="itinerary-step-marker" aria-hidden="true" />
                          <div className="itinerary-step-body">
                            <div className="itinerary-step-header">
                              {step.time && (
                                <span className="itinerary-step-time">{step.time}</span>
                              )}
                              <span className="itinerary-step-title">{step.title}</span>
                            </div>
                            {step.description && (
                              <p className="itinerary-step-description">{step.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Quick Facts */}
          <div className="tour-detail-section">
            <h2>Tour Details</h2>
            <div className="tour-quick-facts">
              <div className="quick-fact-item">
                <span className="quick-fact-icon">⏱️</span>
                <div>
                  <div className="quick-fact-label">Duration</div>
                  <div className="quick-fact-value">{tour.duration}</div>
                </div>
              </div>
              <div className="quick-fact-item">
                <span className="quick-fact-icon">👥</span>
                <div>
                  <div className="quick-fact-label">Group Size</div>
                  <div className="quick-fact-value">{tour.groupSize}</div>
                </div>
              </div>
              <div className="quick-fact-item">
                <span className="quick-fact-icon">⭐</span>
                <div>
                  <div className="quick-fact-label">Rating</div>
                  <div className="quick-fact-value">{tour.rating} / 5</div>
                </div>
              </div>
              <div className="quick-fact-item">
                <span className="quick-fact-icon">📝</span>
                <div>
                  <div className="quick-fact-label">Reviews</div>
                  <div className="quick-fact-value">{tour.reviews} reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right – pricing sidebar */}
        <div className="tour-detail-sidebar">
          <div className="tour-pricing-card">
            <h2>Pricing Options</h2>
            {tour.prices ? (
              <div className="price-options">
                <div className="price-option selected">
                  <span className="price-option-label">👤 Individual</span>
                  <span className="price-option-amount">
                    {tour.prices.individual}
                    <span className="price-per-person"> / person</span>
                  </span>
                </div>
                {tour.prices.group && (
                  <div className="price-option">
                    <span className="price-option-label">👥 Group</span>
                    <span className="price-option-amount">
                      {tour.prices.group}
                      <span className="price-per-person"> / person</span>
                    </span>
                  </div>
                )}
                {tour.prices.sharing && (
                  <div className="price-option">
                    <span className="price-option-label">🚌 Sharing</span>
                    <span className="price-option-amount">
                      {tour.prices.sharing}
                      <span className="price-per-person"> / person</span>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="price-options">
                <div className="price-option selected">
                  <span className="price-option-label">💰 Price</span>
                  <span className="price-option-amount">{tour.price}</span>
                </div>
              </div>
            )}

            <button
              className="btn-book-now"
              onClick={() => setBookingTour(tour)}
            >
              Book This Tour
            </button>
            <p className="pricing-note">
              Free cancellation up to 24 hours before the tour.
              <br />Secure payment · Instant confirmation
            </p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingTour && (
        <BookingModal
          tour={bookingTour}
          onClose={() => setBookingTour(null)}
        />
      )}
    </div>
  );
};

export default TourDetail;