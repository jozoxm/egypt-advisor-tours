import React from 'react';
import useSeoMeta from '../hooks/useSeoMeta';
import { useData } from '../context/DataContext';

const PromotionsPage = ({ onTailorTrip }) => {
  useSeoMeta({
    title: 'Special Offers',
    description:
      'Discover limited-time Egypt travel deals, seasonal discounts, and exclusive offers from Egypt Advisor Tours.',
    path: '/special-offers',
  });
  const { promotions, loading } = useData();

  const active = promotions.filter((p) => {
    if (p.active === false) return false;
    if (p.validUntil && new Date(p.validUntil) < new Date()) return false;
    return true;
  });

  return (
    <section className="blogs">
      <div className="section-header">
        <h2>Special Offers &amp; Promotions</h2>
        <p>Exclusive deals and seasonal discounts — more Egypt for less</p>
      </div>

      {loading.promotions && (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading offers…</p>
      )}

      {!loading.promotions && active.length === 0 && (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          No active promotions right now — check back soon!
        </p>
      )}

      <div className="blogs-grid">
        {active.map((promo, idx) => (
          <article key={promo.id || idx} className="blog-card">
            {promo.imageUrl ? (
              <img
                src={promo.imageUrl}
                alt={promo.title}
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
              />
            ) : (
              <div className="blog-icon">🔥</div>
            )}
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-category">{promo.badgeText || 'Special Offer'}</span>
                {promo.discount && (
                  <span className="blog-date" style={{ color: '#e6a817', fontWeight: 700 }}>
                    {promo.discount}
                  </span>
                )}
              </div>
              <h3>{promo.title}</h3>
              {promo.tourName && (
                <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>
                  Tour: {promo.tourName}
                </p>
              )}
              {promo.validUntil && (
                <p style={{ fontSize: '0.8rem', color: '#aaa' }}>
                  Valid until {new Date(promo.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              )}
              <div className="blog-footer">
                <button className="text-button" onClick={onTailorTrip}>
                  Book this deal →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PromotionsPage;
