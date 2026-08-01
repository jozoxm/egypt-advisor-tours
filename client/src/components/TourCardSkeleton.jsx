import React from 'react';
import './TourCardSkeleton.css';

const TourCardSkeleton = () => (
  <div className="tour-card skeleton-card" aria-hidden="true">
    <div className="tour-image-wrapper skeleton-image" />
    <div className="tour-content">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-short" />
      <div className="skeleton-line skeleton-medium" />
      <div className="skeleton-line skeleton-medium" />
      <div className="skeleton-footer">
        <div className="skeleton-line skeleton-price" />
        <div className="skeleton-line skeleton-btn" />
      </div>
    </div>
  </div>
);

export default TourCardSkeleton;
