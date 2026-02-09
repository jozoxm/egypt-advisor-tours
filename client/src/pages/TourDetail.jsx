import React from 'react';
import { useParams } from 'react-router-dom';

const TourDetail = () => {
  const { id } = useParams();

  const tour = {
    id: id,
    title: 'Giza Pyramids & Sphinx',
    description: 'Explore the iconic pyramids and the great sphinx of Giza',
    duration: '2 days',
    price: 299,
    rating: 4.8,
    highlights: [
      'Visit the Great Pyramid of Khufu',
      'Explore the Pyramid of Khafre',
      'See the mysterious Sphinx',
      'Learn about ancient Egyptian civilization',
      'Professional Egyptologist guide',
      'Hotel transfers included'
    ]
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>{tour.title}</h1>
      
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        backgroundColor: '#f5f5f5',
        padding: '15px',
        borderRadius: '5px'
      }}>
        <span>⏱️ Duration: {tour.duration}</span>
        <span>💰 Price: ${tour.price}</span>
        <span>⭐ Rating: {tour.rating}/5</span>
      </div>

      <h2>Highlights</h2>
      <ul>
        {tour.highlights.map((highlight, index) => (
          <li key={index}>✓ {highlight}</li>
        ))}
      </ul>

      <h2>Book This Tour</h2>
      <form style={{ 
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '5px',
        maxWidth: '500px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Name *</label>
          <input 
            type="text" 
            required 
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email *</label>
          <input 
            type="email" 
            required 
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Phone *</label>
          <input 
            type="tel" 
            required 
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Date *</label>
          <input 
            type="date" 
            required 
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Number of Travelers *</label>
          <input 
            type="number" 
            required 
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <button 
          type="submit"
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%',
            fontSize: '16px'
          }}
        >
          Book Now
        </button>
      </form>
    </div>
  );
};

export default TourDetail;