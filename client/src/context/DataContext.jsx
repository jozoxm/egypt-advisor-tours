import React, { createContext, useContext, useState, useEffect } from 'react';
import { tours as defaultTours, testimonials as defaultTestimonials } from '../data/tours-data';
import { contactInfo as defaultContactInfo } from '../data/contact-info';
import { blogs as defaultBlogs } from '../data/blogs-data';
import { siteSettings as defaultSiteSettings } from '../data/site-settings';
import { promotions as defaultPromotions } from '../data/promotions-data';
import { destinations as defaultDestinations } from '../data/destinations-data';

const API_URL = process.env.REACT_APP_API_URL || '';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [tours, setTours]               = useState(defaultTours);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [contactInfo, setContactInfo]   = useState(defaultContactInfo);
  const [blogs, setBlogs]               = useState(defaultBlogs);
  const [siteSettings, setSiteSettings] = useState(defaultSiteSettings);
  const [promotions, setPromotions]     = useState(defaultPromotions);
  const [destinations, setDestinations] = useState(defaultDestinations);

  // Per-resource loading flags so the UI can show skeletons independently.
  const [loading, setLoading] = useState({
    tours: true,
    contact: true,
    blogs: true,
    settings: true,
    promotions: true,
    destinations: true,
  });

  useEffect(() => {
    let isMounted = true;

    // Tours & testimonials
    fetch(`${API_URL}/api/tours`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (data.tours) setTours(data.tours);
        if (data.testimonials) setTestimonials(data.testimonials);
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading((l) => ({ ...l, tours: false })); });

    // Contact info
    fetch(`${API_URL}/api/contact`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        setContactInfo(data);
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading((l) => ({ ...l, contact: false })); });

    // Blogs
    fetch(`${API_URL}/api/blogs`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || !data.blogs) return;
        setBlogs(data.blogs);
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading((l) => ({ ...l, blogs: false })); });

    // Site settings
    fetch(`${API_URL}/api/settings`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || !data.hero) return;
        setSiteSettings(data);
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading((l) => ({ ...l, settings: false })); });

    // Promotions
    fetch(`${API_URL}/api/promotions`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (Array.isArray(data.promotions)) setPromotions(data.promotions);
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading((l) => ({ ...l, promotions: false })); });

    // Destinations
    fetch(`${API_URL}/api/destinations`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (Array.isArray(data.destinations)) setDestinations(data.destinations);
      })
      .catch(() => {})
      .finally(() => { if (isMounted) setLoading((l) => ({ ...l, destinations: false })); });

    return () => { isMounted = false; };
  }, []);

  return (
    <DataContext.Provider
      value={{ tours, testimonials, contactInfo, blogs, siteSettings, promotions, destinations, loading }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside a DataProvider');
  return ctx;
};

export default DataContext;
