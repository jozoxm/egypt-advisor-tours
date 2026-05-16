import React, { useEffect, useState } from 'react';
import useSeoMeta from '../hooks/useSeoMeta';
import { getAbout } from '../api/cms';
import { fallbackAbout } from '../data/cms-fallbacks';

const About = () => {
  const [aboutContent, setAboutContent] = useState(fallbackAbout);

  useEffect(() => {
    let isMounted = true;

    getAbout()
      .then((data) => {
        if (!isMounted || !data || typeof data !== 'object') return;
        setAboutContent((prev) => ({
          ...prev,
          ...data,
          sections: Array.isArray(data.sections) && data.sections.length > 0 ? data.sections : prev.sections,
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useSeoMeta({
    title: 'About Us',
    description:
      'Learn why travelers choose Egypt Advisor Tours for expert guides, personalized service, and trusted local support.',
    path: '/about',
  });
  return (
  <section id="about" className="about">
    <div className="about-content">
      <h2>{aboutContent.pageTitle || fallbackAbout.pageTitle}</h2>
      <p className="about-intro">{aboutContent.intro || fallbackAbout.intro}</p>

      <div className="features-grid">
        {(Array.isArray(aboutContent.sections) ? aboutContent.sections : []).map((section, index) => (
          <div className="feature-card" key={`${section?.title || 'section'}-${index}`}>
            <div className="feature-icon">{section?.icon || '•'}</div>
            <h3>{section?.title || ''}</h3>
            <p>{section?.body || section?.description || ''}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  );
};

export default About;
