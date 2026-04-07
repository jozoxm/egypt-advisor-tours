import React from 'react';
import PropTypes from 'prop-types';
import './TourCard.css';

const TourCard = ({ image, title, description, duration, price, rating }) => {
  return (
    <div className="tour-card">
      <img src={image} alt={title} className="tour-card__image" loading="lazy" />
      <h3 className="tour-card__title">{title}</h3>
      <p className="tour-card__description">{description}</p>
      <p className="tour-card__duration">Duration: {duration}</p>
      <p className="tour-card__price">Price: ${price}</p>
      <p className="tour-card__rating">Rating: {rating} ⭐</p>
      <button className="tour-card__button">Book Now</button>
    </div>
  );
};

TourCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  rating: PropTypes.number.isRequired,
};

export default TourCard;
