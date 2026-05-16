import React, { useEffect, useState } from 'react';
import useSeoMeta from '../hooks/useSeoMeta';
import { getFaq } from '../api/cms';
import { fallbackFaq } from '../data/cms-fallbacks';

const Faq = ({ onTailorTrip }) => {
  const [faqContent, setFaqContent] = useState(fallbackFaq);
  const [openItems, setOpenItems] = useState({});

  useEffect(() => {
    let isMounted = true;

    getFaq()
      .then((data) => {
        if (!isMounted || !data || typeof data !== 'object') return;
        setFaqContent((prev) => ({
          ...prev,
          ...data,
          categories: Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : prev.categories,
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useSeoMeta({
    title: 'FAQ',
    description: 'Frequently asked questions about planning and booking your Egypt trip.',
    path: '/faq',
  });

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const categories = Array.isArray(faqContent?.categories) ? faqContent.categories : [];
  const contactCta = faqContent?.contactCta;

  return (
    <section id="faq" className="about">
      <div className="about-content">
        <h2>{faqContent?.pageTitle || fallbackFaq.pageTitle}</h2>
        <p className="about-intro">{faqContent?.pageIntro || fallbackFaq.pageIntro}</p>

        <div className="features-grid">
          {categories.map((category, categoryIndex) => (
            <div className="feature-card" key={`${category?.title || 'category'}-${categoryIndex}`}>
              <h3>{category?.title || `Category ${categoryIndex + 1}`}</h3>
              <div>
                {(Array.isArray(category?.items) ? category.items : []).map((item, itemIndex) => {
                  const itemKey = `${categoryIndex}-${itemIndex}`;
                  const expanded = Boolean(openItems[itemKey]);
                  return (
                    <div key={itemKey} style={{ marginBottom: '12px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ width: '100%', textAlign: 'left' }}
                        onClick={() => toggleItem(itemKey)}
                        aria-expanded={expanded}
                      >
                        {item?.question || `Question ${itemIndex + 1}`}
                      </button>
                      {expanded && (
                        <p style={{ marginTop: '8px' }}>{item?.answer || ''}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {contactCta && (
          <div className="feature-card" style={{ marginTop: '24px' }}>
            <h3>{contactCta?.title || ''}</h3>
            <p>{contactCta?.description || ''}</p>
            {contactCta?.action === 'open-tailor-trip-modal' ? (
              <button type="button" className="btn btn-primary" onClick={onTailorTrip}>
                {contactCta?.actionLabel || 'Tailor My Trip'}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
};

export default Faq;

