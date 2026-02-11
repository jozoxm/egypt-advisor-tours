import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './TourCard.css';

const TourCard = ({ tour }) => {
  return (
    <div className="tour-card">
      <div className="tour-card__image-container">
        <img src={tour.image} alt={tour.title} className="tour-card__image" />
        {tour.featured && <span className="featured-badge">Featured</span>}
      </div>
      <div className="tour-card__content">
        <h3 className="tour-card__title">{tour.title}</h3>
        <p className="tour-card__description">
          {tour.description.length > 120 
            ? tour.description.substring(0, 120) + '...' 
            : tour.description}
        </p>
        <div className="tour-card__details">
          <span className="tour-card__duration">⏱️ {tour.duration}</span>
          <span className="tour-card__rating">⭐ {tour.rating}</span>
        </div>
        <div className="tour-card__footer">
          <span className="tour-card__price">${tour.price}</span>
          <Link to={`/tours/${tour._id}`} className="tour-card__button">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

TourCard.propTypes = {
  tour: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    rating: PropTypes.number.isRequired,
    featured: PropTypes.bool,
  }).isRequired,
};

export default TourCard;
