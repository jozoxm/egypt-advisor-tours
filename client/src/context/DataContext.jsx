import React, { createContext, useContext, useState, useEffect } from 'react';
import { tours as defaultTours, testimonials as defaultTestimonials } from '../data/tours-data';
import { contactInfo as defaultContactInfo } from '../data/contact-info';
import { blogs as defaultBlogs } from '../data/blogs-data';
import { siteSettings as defaultSiteSettings } from '../data/site-settings';

const API_URL = process.env.REACT_APP_API_URL || '';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [tours, setTours]               = useState(defaultTours);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [contactInfo, setContactInfo]   = useState(defaultContactInfo);
  const [blogs, setBlogs]               = useState(defaultBlogs);
  const [siteSettings, setSiteSettings] = useState(defaultSiteSettings);

  // Per-resource loading flags so the UI can show skeletons independently.
  const [loading, setLoading] = useState({
    tours: true,
    contact: true,
    blogs: true,
    settings: true,
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

    return () => { isMounted = false; };
  }, []);

  return (
    <DataContext.Provider
      value={{ tours, testimonials, contactInfo, blogs, siteSettings, loading }}
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
