import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import BookingForm from '../components/BookingForm';
import './TourDetail.css';

const TourDetail = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_URL}/tours/${id}`);
        setTour(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tour:', error);
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading tour details...</div>;
  }

  if (!tour) {
    return <div className="error">Tour not found</div>;
  }

  return (
    <div className="tour-detail">
      <div className="tour-detail__hero" style={{ backgroundImage: `url(${tour.image})` }}>
        <div className="tour-detail__hero-overlay">
          <div className="container">
            <h1>{tour.title}</h1>
            <div className="tour-detail__meta">
              <span>⏱️ {tour.duration}</span>
              <span>⭐ {tour.rating}/5</span>
              <span>📍 {tour.category}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tour-detail__content">
        <div className="container">
          <div className="tour-detail__grid">
            <div className="tour-detail__main">
              <section className="tour-section">
                <h2>About This Tour</h2>
                <p>{tour.description}</p>
              </section>

              <section className="tour-section">
                <h2>Highlights</h2>
                <ul className="highlights-list">
                  {tour.highlights.map((highlight, index) => (
                    <li key={index}>✓ {highlight}</li>
                  ))}
                </ul>
              </section>

              <section className="tour-section">
                <h2>What's Included</h2>
                <ul className="included-list">
                  {tour.included.map((item, index) => (
                    <li key={index}>✓ {item}</li>
                  ))}
                </ul>
              </section>

              {tour.itinerary && tour.itinerary.length > 0 && (
                <section className="tour-section">
                  <h2>Itinerary</h2>
                  <div className="itinerary">
                    {tour.itinerary.map((day, index) => (
                      <div key={index} className="itinerary-day">
                        <h3>Day {day.day}</h3>
                        <p>{day.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="tour-detail__sidebar">
              <div className="price-box">
                <div className="price-amount">
                  <span className="price-label">From</span>
                  <span className="price-value">${tour.price}</span>
                  <span className="price-per">per person</span>
                </div>
              </div>

              <BookingForm tourId={tour._id} tourTitle={tour.title} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;