import React, { useState } from 'react';
import useTitle from '../hooks/useTitle';
import { useData } from '../context/DataContext';

const REGION_LABELS = {
  'lower-egypt':    'Lower Egypt',
  'upper-egypt':    'Upper Egypt',
  'red-sea':        'Red Sea',
  'sinai':          'Sinai',
  'western-desert': 'Western Desert',
  'mediterranean':  'Mediterranean',
};

const DestinationsPage = ({ onTailorTrip }) => {
  useTitle('Destinations');
  const { destinations, loading } = useData();
  const [selected, setSelected] = useState(null);

  const getKey = (dest) => dest.id || dest.name;

  const sorted = [...destinations].sort((a, b) => (a.order || 0) - (b.order || 0));
  const current = sorted.find((d) => getKey(d) === selected) || null;

  return (
    <section className="blogs">
      <div className="section-header">
        <h2>Explore Egypt's Destinations</h2>
        <p>From ancient Nile cities to turquoise Red Sea coasts — discover where your journey takes you</p>
      </div>

      {loading.destinations && (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading destinations…</p>
      )}

      {!loading.destinations && sorted.length === 0 && (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Destination guides coming soon — stay tuned!
        </p>
      )}

      {current && (
        <div
          style={{
            background: '#fff8f0',
            border: '1px solid #f0d9b5',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <button
            className="text-button"
            style={{ marginBottom: '1rem', fontSize: '0.85rem' }}
            onClick={() => setSelected(null)}
          >
            ← Back to all destinations
          </button>
          {current.imageUrl && (
            <img
              src={current.imageUrl}
              alt={current.name}
              style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }}
            />
          )}
          <h2 style={{ marginBottom: '0.25rem' }}>{current.name}</h2>
          {current.region && (
            <span className="blog-category" style={{ marginBottom: '1rem', display: 'inline-block' }}>
              {REGION_LABELS[current.region] || current.region}
            </span>
          )}
          {current.tagline && <p style={{ fontStyle: 'italic', color: '#888', marginBottom: '1rem' }}>{current.tagline}</p>}
          {current.bestTimeToVisit && (
            <p style={{ marginBottom: '1rem' }}>
              <strong>🗓 Best time to visit:</strong> {current.bestTimeToVisit}
            </p>
          )}
          {Array.isArray(current.highlights) && current.highlights.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem' }}>Top Highlights</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {current.highlights.map((h, i) => (
                  <li key={i} style={{ background: '#fff', border: '1px solid #ecdbb8', borderRadius: '8px', padding: '0.75rem' }}>
                    {h.emoji && <span style={{ fontSize: '1.4rem', marginRight: '0.5rem' }}>{h.emoji}</span>}
                    <strong>{h.title}</strong>
                    {h.description && <p style={{ fontSize: '0.82rem', color: '#666', marginTop: '0.25rem' }}>{h.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className="btn btn-primary" onClick={onTailorTrip} style={{ marginTop: '1rem' }}>
            Plan a trip to {current.name}
          </button>
        </div>
      )}

      <div className="blogs-grid">
        {sorted.map((dest, idx) => (
          <article key={getKey(dest) || idx} className="blog-card">
            {dest.imageUrl ? (
              <img
                src={dest.imageUrl}
                alt={dest.name}
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
              />
            ) : (
              <div className="blog-icon">🏛️</div>
            )}
            <div className="blog-content">
              <div className="blog-meta">
                {dest.region && (
                  <span className="blog-category">{REGION_LABELS[dest.region] || dest.region}</span>
                )}
                {dest.featured && <span className="blog-date">⭐ Featured</span>}
              </div>
              <h3>{dest.name}</h3>
              {dest.tagline && <p className="blog-excerpt">{dest.tagline}</p>}
              <div className="blog-footer">
                <button className="text-button" onClick={() => setSelected(getKey(dest))}>
                  Explore {dest.name} →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DestinationsPage;
