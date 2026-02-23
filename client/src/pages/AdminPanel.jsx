import React, { useState, useEffect, useCallback } from 'react';
import './AdminPanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NAV_TABS = [
  { id: 'dashboard',    icon: '📊', label: 'Dashboard' },
  { id: 'slideshow',   icon: '🖼️', label: 'Slideshow' },
  { id: 'tours',       icon: '🎫', label: 'Tours' },
  { id: 'blogs',       icon: '📝', label: 'Blogs' },
  { id: 'gallery',     icon: '🗃️', label: 'Gallery' },
  { id: 'bookings',    icon: '📅', label: 'Bookings' },
  { id: 'testimonials',icon: '💬', label: 'Testimonials' },
  { id: 'settings',    icon: '⚙️', label: 'Site Settings' },
  { id: 'contact',     icon: '📞', label: 'Contact Info' },
  { id: 'instructions',icon: '📚', label: 'Help' },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tours, setTours] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingTourId, setEditingTourId] = useState(null);
  const [editingTour, setEditingTour] = useState(null);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [slides, setSlides] = useState([]);
  const [editingSlideshowId, setEditingSlideshowId] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);
  // Testimonials editing
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  // Site settings
  const [siteSettings, setSiteSettings] = useState({
    hero: { badge: '', title: '', subtitle: '', primaryButtonText: '', secondaryButtonText: '' },
    stats: []
  });
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper function to show messages
  const showSaveMessage = useCallback((message, type = 'info') => {
    setSaveMessage({ text: message, type });
    setTimeout(() => setSaveMessage(''), 5000);
  }, []);

  // Load data from server
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [toursRes, contactRes, blogsRes, galleryRes, bookingsRes, slideshowRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/api/tours`),
        fetch(`${API_URL}/api/contact`),
        fetch(`${API_URL}/api/blogs`),
        fetch(`${API_URL}/api/gallery`),
        fetch(`${API_URL}/api/bookings`),
        fetch(`${API_URL}/api/slideshow`),
        fetch(`${API_URL}/api/settings`)
      ]);
      
      if (toursRes.ok && contactRes.ok) {
        const toursData = await toursRes.json();
        const contactData = await contactRes.json();
        
        setTours(toursData.tours || []);
        setTestimonials(toursData.testimonials || []);
        setContactInfo(contactData);
        
        if (blogsRes.ok) {
          const blogsData = await blogsRes.json();
          setBlogs(blogsData.blogs || []);
        }
        
        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          setGallery(galleryData.gallery || []);
        }
        
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.bookings || []);
        }

        if (slideshowRes.ok) {
          const slideshowData = await slideshowRes.json();
          setSlides(slideshowData.slides || []);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSiteSettings(settingsData);
        }
        
        showSaveMessage('Data loaded successfully!', 'success');
      } else {
        showSaveMessage('Failed to load data from server', 'error');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showSaveMessage('Server not running. Using local data.', 'warning');
      // Fallback to local imports if server is not running
      try {
        const { tours: localTours, testimonials: localTestimonials } = await import('../data/tours-data');
        const { contactInfo: localContactInfo } = await import('../data/contact-info');
        const { blogs: localBlogs } = await import('../data/blogs-data');
        const { gallery: localGallery } = await import('../data/gallery-data');
        const { bookings: localBookings } = await import('../data/bookings-data');
        const { slides: localSlides } = await import('../data/slideshow-data');
        const { siteSettings: localSettings } = await import('../data/site-settings');
        setTours(localTours);
        setTestimonials(localTestimonials || []);
        setContactInfo(localContactInfo);
        setBlogs(localBlogs || []);
        setGallery(localGallery || []);
        setBookings(localBookings || []);
        setSlides(localSlides || []);
        setSiteSettings(localSettings || {});
      } catch (importError) {
        showSaveMessage('Failed to load data', 'error');
      }
    }
    setLoading(false);
  }, [showSaveMessage]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle tour editing
  const startEditTour = (tour) => {
    setEditingTourId(tour.id);
    setEditingTour({ ...tour });
  };

  const cancelEditTour = () => {
    // If this was a new tour that wasn't saved yet, remove it from tours array
    if (editingTour && !tours.find(t => t.id === editingTour.id && JSON.stringify(t) === JSON.stringify(editingTour))) {
      // This is a new tour that was just added but not saved
      const wasSaved = tours.some(tour => 
        tour.id === editingTour.id && 
        (tour.name !== 'New Tour' || tour.description !== 'Enter tour description here...')
      );
      
      if (!wasSaved) {
        // Remove the unsaved new tour from state
        setTours(tours.filter(tour => tour.id !== editingTour.id));
      }
    }
    
    setEditingTourId(null);
    setEditingTour(null);
  };

  const saveTour = async () => {
    const updatedTours = tours.map(tour => 
      tour.id === editingTour.id ? editingTour : tour
    );
    setTours(updatedTours);
    setEditingTourId(null);
    setEditingTour(null);
    
    // Save to server
    await saveToursToServer(updatedTours);
  };

  const saveToursToServer = async (toursData) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/tours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tours: toursData,
          testimonials: testimonials
        }),
      });

      if (response.ok) {
        showSaveMessage('✓ Tours saved successfully! Changes are now permanent.', 'success');
      } else {
        showSaveMessage('Failed to save tours to server', 'error');
      }
    } catch (error) {
      console.error('Error saving tours:', error);
      showSaveMessage('Failed to connect to server. Make sure the server is running.', 'error');
    }
    setSaving(false);
  };

  const updateEditingTour = (field, value) => {
    setEditingTour({ ...editingTour, [field]: value });
  };

  const handleTourPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showSaveMessage('Image file too large. Please use a file smaller than 5MB.', 'error');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        showSaveMessage('Please upload an image file.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Store the base64 encoded image
        updateEditingTour('photoUrl', reader.result);
        showSaveMessage('Image uploaded successfully!', 'success');
      };
      reader.onerror = () => {
        showSaveMessage('Failed to upload image. Please try again.', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewTour = () => {
    const newTour = {
      id: Math.max(0, ...tours.map(t => t.id)) + 1,
      name: 'New Tour',
      price: '$199',
      duration: '4 hours',
      description: 'Enter tour description here...',
      image: '🏛️',
      photoUrl: '',
      rating: 4.5,
      reviews: 0,
      groupSize: '2-10 people'
    };
    setEditingTour(newTour);
    setEditingTourId(newTour.id);
    setTours([...tours, newTour]);
  };

  const deleteTour = async (tourId) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      const updatedTours = tours.filter(tour => tour.id !== tourId);
      setTours(updatedTours);
      await saveToursToServer(updatedTours);
    }
  };

  // Handle contact info editing
  const updateContactInfo = (field, value) => {
    let updatedContactInfo;
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedContactInfo = {
        ...contactInfo,
        [parent]: {
          ...contactInfo[parent],
          [child]: value
        }
      };
    } else {
      updatedContactInfo = { ...contactInfo, [field]: value };
    }
    setContactInfo(updatedContactInfo);
    
    // Auto-save contact info
    saveContactInfoToServer(updatedContactInfo);
  };

  const saveContactInfoToServer = async (contactData) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        showSaveMessage('✓ Contact info saved successfully!', 'success');
      } else {
        showSaveMessage('Failed to save contact info to server', 'error');
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      showSaveMessage('Failed to connect to server. Make sure the server is running.', 'error');
    }
    setSaving(false);
  };

  // ============================================
  // BLOG MANAGEMENT FUNCTIONS
  // ============================================
  
  const startEditBlog = (blog) => {
    setEditingBlogId(blog.id);
    setEditingBlog({ ...blog });
  };

  const cancelEditBlog = () => {
    setEditingBlogId(null);
    setEditingBlog(null);
  };

  const saveBlog = async () => {
    const updatedBlogs = blogs.map(blog => 
      blog.id === editingBlog.id ? editingBlog : blog
    );
    setBlogs(updatedBlogs);
    setEditingBlogId(null);
    setEditingBlog(null);
    await saveBlogsToServer(updatedBlogs);
  };

  const addNewBlog = () => {
    const newBlog = {
      id: Math.max(...blogs.map(b => b.id), 0) + 1,
      title: 'New Blog Post',
      author: 'Egypt Advisor Team',
      date: new Date().toISOString().split('T')[0],
      excerpt: 'Enter a brief excerpt...',
      content: 'Enter the full blog content here...',
      image: '📝',
      category: 'Travel Tips',
      featured: false
    };
    setEditingBlog(newBlog);
    setEditingBlogId(newBlog.id);
    setBlogs([...blogs, newBlog]);
  };

  const deleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      const updatedBlogs = blogs.filter(blog => blog.id !== blogId);
      setBlogs(updatedBlogs);
      await saveBlogsToServer(updatedBlogs);
    }
  };

  const updateEditingBlog = (field, value) => {
    setEditingBlog({ ...editingBlog, [field]: value });
  };

  const saveBlogsToServer = async (blogsData) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blogs: blogsData }),
      });

      if (response.ok) {
        showSaveMessage('✓ Blog saved successfully!', 'success');
      } else {
        showSaveMessage('Failed to save blog to server', 'error');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      showSaveMessage('Failed to connect to server.', 'error');
    }
    setSaving(false);
  };

  // ============================================
  // GALLERY MANAGEMENT FUNCTIONS
  // ============================================
  
  const startEditGallery = (item) => {
    setEditingGalleryId(item.id);
    setEditingGalleryItem({ ...item });
  };

  const cancelEditGallery = () => {
    setEditingGalleryId(null);
    setEditingGalleryItem(null);
  };

  const saveGalleryItem = async () => {
    const updatedGallery = gallery.map(item => 
      item.id === editingGalleryItem.id ? editingGalleryItem : item
    );
    setGallery(updatedGallery);
    setEditingGalleryId(null);
    setEditingGalleryItem(null);
    await saveGalleryToServer(updatedGallery);
  };

  const addNewGalleryItem = () => {
    const newItem = {
      id: Math.max(...gallery.map(g => g.id), 0) + 1,
      title: 'New Image',
      description: 'Enter description...',
      imageUrl: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800',
      category: 'General',
      featured: false,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setEditingGalleryItem(newItem);
    setEditingGalleryId(newItem.id);
    setGallery([...gallery, newItem]);
  };

  const deleteGalleryItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      const updatedGallery = gallery.filter(item => item.id !== itemId);
      setGallery(updatedGallery);
      await saveGalleryToServer(updatedGallery);
    }
  };

  const updateEditingGalleryItem = (field, value) => {
    setEditingGalleryItem({ ...editingGalleryItem, [field]: value });
  };

  const saveGalleryToServer = async (galleryData) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gallery: galleryData }),
      });

      if (response.ok) {
        showSaveMessage('✓ Gallery saved successfully!', 'success');
      } else {
        showSaveMessage('Failed to save gallery to server', 'error');
      }
    } catch (error) {
      console.error('Error saving gallery:', error);
      showSaveMessage('Failed to connect to server.', 'error');
    }
    setSaving(false);
  };

  // ============================================
  // BOOKING MANAGEMENT FUNCTIONS
  // ============================================
  
  const updateBookingStatus = async (bookingId, newStatus) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    );
    setBookings(updatedBookings);
    await saveBookingsToServer(updatedBookings);
  };

  const deleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      setBookings(updatedBookings);
      await saveBookingsToServer(updatedBookings);
    }
  };

  const saveBookingsToServer = async (bookingsData) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookings: bookingsData }),
      });

      if (response.ok) {
        showSaveMessage('✓ Bookings updated successfully!', 'success');
      } else {
        showSaveMessage('Failed to save bookings to server', 'error');
      }
    } catch (error) {
      console.error('Error saving bookings:', error);
      showSaveMessage('Failed to connect to server.', 'error');
    }
    setSaving(false);
  };

  // ============================================
  // SLIDESHOW MANAGEMENT FUNCTIONS
  // ============================================

  const startEditSlide = (slide) => {
    setEditingSlideshowId(slide.id);
    setEditingSlide({ ...slide });
  };

  const cancelEditSlide = () => {
    // Remove the slide if it was a newly added (unsaved) slide
    if (editingSlide) {
      const originalSlide = slides.find(s => s.id === editingSlide.id);
      if (originalSlide && originalSlide.name === 'New Slide' && originalSlide.image === '') {
        setSlides(slides.filter(s => s.id !== editingSlide.id));
      }
    }
    setEditingSlideshowId(null);
    setEditingSlide(null);
  };

  const saveSlide = async () => {
    const updatedSlides = slides.map(s => s.id === editingSlide.id ? editingSlide : s);
    setSlides(updatedSlides);
    setEditingSlideshowId(null);
    setEditingSlide(null);
    await saveSlideshowToServer(updatedSlides);
  };

  const addNewSlide = () => {
    const newSlide = {
      id: Math.max(0, ...slides.map(s => s.id || 0)) + 1,
      name: 'New Slide',
      image: '',
      gradient: 'linear-gradient(135deg, #8B6914 0%, #C9A961 50%, #D4AF37 100%)'
    };
    setEditingSlide(newSlide);
    setEditingSlideshowId(newSlide.id);
    setSlides([...slides, newSlide]);
  };

  const deleteSlide = async (slideId) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      const updatedSlides = slides.filter(s => s.id !== slideId);
      setSlides(updatedSlides);
      await saveSlideshowToServer(updatedSlides);
    }
  };

  const updateEditingSlide = (field, value) => {
    setEditingSlide({ ...editingSlide, [field]: value });
  };

  const handleSlidePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showSaveMessage('Image file too large. Please use a file smaller than 5MB.', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showSaveMessage('Please upload an image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateEditingSlide('image', reader.result);
      showSaveMessage('Image uploaded successfully!', 'success');
    };
    reader.onerror = () => {
      showSaveMessage('Failed to upload image. Please try again.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const saveSlideshowToServer = async (slidesData) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/slideshow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: slidesData }),
      });

      if (response.ok) {
        showSaveMessage('✓ Slideshow saved successfully!', 'success');
      } else {
        showSaveMessage('Failed to save slideshow to server', 'error');
      }
    } catch (error) {
      console.error('Error saving slideshow:', error);
      showSaveMessage('Failed to connect to server.', 'error');
    }
    setSaving(false);
  };

  // ============================================
  // TESTIMONIALS MANAGEMENT FUNCTIONS
  // ============================================

  const startEditTestimonial = (index) => {
    setEditingTestimonialIndex(index);
    setEditingTestimonial({ ...testimonials[index] });
  };

  const cancelEditTestimonial = () => {
    // Remove the testimonial if it was newly added and not yet saved
    if (editingTestimonial && editingTestimonial._isNew) {
      setTestimonials(testimonials.filter((_, i) => i !== editingTestimonialIndex));
    }
    setEditingTestimonialIndex(null);
    setEditingTestimonial(null);
  };

  const saveTestimonial = async () => {
    // Strip internal tracking flag before saving
    const { _isNew: _removed, ...cleanTestimonial } = editingTestimonial;
    const updatedTestimonials = testimonials.map((t, i) =>
      i === editingTestimonialIndex ? cleanTestimonial : t
    );
    setTestimonials(updatedTestimonials);
    setEditingTestimonialIndex(null);
    setEditingTestimonial(null);
    await saveTestimonialsToServer(updatedTestimonials);
  };

  const addNewTestimonial = () => {
    const newTestimonial = {
      _isNew: true,
      name: 'Customer Name',
      country: 'Country',
      text: 'Enter review text here...'
    };
    const newIndex = testimonials.length;
    setTestimonials([...testimonials, newTestimonial]);
    setEditingTestimonialIndex(newIndex);
    setEditingTestimonial(newTestimonial);
  };

  const deleteTestimonial = async (index) => {
    if (window.confirm('Delete this testimonial?')) {
      const updatedTestimonials = testimonials.filter((_, i) => i !== index);
      setTestimonials(updatedTestimonials);
      await saveTestimonialsToServer(updatedTestimonials);
    }
  };

  const updateEditingTestimonial = (field, value) => {
    setEditingTestimonial({ ...editingTestimonial, [field]: value });
  };

  const saveTestimonialsToServer = async (testimonialsData) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/tours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tours, testimonials: testimonialsData }),
      });
      if (response.ok) {
        showSaveMessage('✓ Testimonials saved successfully!', 'success');
      } else {
        showSaveMessage('Failed to save testimonials to server', 'error');
      }
    } catch (error) {
      console.error('Error saving testimonials:', error);
      showSaveMessage('Failed to connect to server.', 'error');
    }
    setSaving(false);
  };

  // ============================================
  // SITE SETTINGS FUNCTIONS
  // ============================================

  const updateSiteSettingsHero = (field, value) => {
    setSiteSettings(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateSiteSettingsStat = (index, field, value) => {
    const updatedStats = siteSettings.stats.map((stat, i) =>
      i === index ? { ...stat, [field]: value } : stat
    );
    setSiteSettings(prev => ({ ...prev, stats: updatedStats }));
  };

  const saveSiteSettingsToServer = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      if (response.ok) {
        showSaveMessage('✓ Site settings saved! Refresh the website to see your changes.', 'success');
      } else {
        showSaveMessage('Failed to save site settings', 'error');
      }
    } catch (error) {
      console.error('Error saving site settings:', error);
      showSaveMessage('Failed to connect to server.', 'error');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span className="admin-brand-icon">🎨</span>
            <div>
              <h2>Admin Panel</h2>
              <p>Egypt Advisor Tours</p>
            </div>
          </div>
        </aside>
        <div className="admin-main">
          <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">🎨</span>
          <div>
            <h2>Admin Panel</h2>
            <p>Egypt Advisor Tours</p>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {saving && <div className="saving-indicator">💾 Saving...</div>}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-main">
        {saveMessage && (
          <div className={`save-message save-message-topbar ${saveMessage.type}`}>
            {saveMessage.text}
          </div>
        )}

        <div className="admin-content">
          <h1 className="admin-page-title">
            {NAV_TABS.find(t => t.id === activeTab)?.icon}{' '}
            {NAV_TABS.find(t => t.id === activeTab)?.label}
          </h1>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <p className="dashboard-subtitle">Here's an overview of your Egypt Advisor Tours website.</p>

              <div className="dashboard-stats">
                <div className="dash-stat-card">
                  <div className="dash-stat-icon">🎫</div>
                  <div className="dash-stat-value">{tours.length}</div>
                  <div className="dash-stat-label">Total Tours</div>
                </div>
                <div className="dash-stat-card accent-green">
                  <div className="dash-stat-icon">✅</div>
                  <div className="dash-stat-value">{bookings.filter(b => b.status === 'confirmed').length}</div>
                  <div className="dash-stat-label">Confirmed Bookings</div>
                </div>
                <div className="dash-stat-card accent-yellow">
                  <div className="dash-stat-icon">⏳</div>
                  <div className="dash-stat-value">{bookings.filter(b => b.status === 'pending').length}</div>
                  <div className="dash-stat-label">Pending Bookings</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon">📅</div>
                  <div className="dash-stat-value">{bookings.length}</div>
                  <div className="dash-stat-label">Total Bookings</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon">📝</div>
                  <div className="dash-stat-value">{blogs.length}</div>
                  <div className="dash-stat-label">Blog Posts</div>
                </div>
                <div className="dash-stat-card">
                  <div className="dash-stat-icon">💬</div>
                  <div className="dash-stat-value">{testimonials.length}</div>
                  <div className="dash-stat-label">Testimonials</div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-section">
                  <h3>⚡ Quick Actions</h3>
                  <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => { setActiveTab('tours'); addNewTour(); }}>
                      ➕ Add New Tour
                    </button>
                    <button className="quick-action-btn" onClick={() => { setActiveTab('blogs'); addNewBlog(); }}>
                      📝 Add New Blog Post
                    </button>
                    <button className="quick-action-btn" onClick={() => { setActiveTab('slideshow'); addNewSlide(); }}>
                      🖼️ Add Slideshow Image
                    </button>
                    <button className="quick-action-btn" onClick={() => { setActiveTab('testimonials'); addNewTestimonial(); }}>
                      💬 Add Testimonial
                    </button>
                  </div>
                </div>

                <div className="dashboard-section">
                  <h3>📅 Recent Bookings</h3>
                  {bookings.length === 0 ? (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>No bookings yet.</p>
                  ) : (
                    bookings.slice(0, 6).map(booking => (
                      <div key={booking.id} className="recent-booking-row">
                        <span className="rb-name">{booking.customerName}</span>
                        <span className="rb-tour">{booking.tourName}</span>
                        <span className={`status-badge ${booking.status}`}>{booking.status}</span>
                      </div>
                    ))
                  )}
                  {bookings.length > 6 && (
                    <button className="view-all-btn" onClick={() => setActiveTab('bookings')}>
                      View all {bookings.length} bookings →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SLIDESHOW TAB */}
          {activeTab === 'slideshow' && (
            <div className="tours-section">
              <div className="section-header-with-action">
                <div>
                  <h2>Manage Home Page Slideshow</h2>
                  <p className="section-description">Upload photos or paste image URLs to change the hero slideshow.</p>
                </div>
                <button className="btn-add" onClick={addNewSlide}>
                  ➕ Add New Slide
                </button>
              </div>

              <div className="tours-list">
                {slides.map(slide => (
                  <div key={slide.id} className="tour-admin-card">
                    {editingSlideshowId === slide.id ? (
                      // EDIT MODE
                      <div className="tour-edit-form">
                        <h3>Editing Slide: {slide.name}</h3>

                        <div className="form-row">
                          <label>Slide Name / Caption:</label>
                          <input
                            type="text"
                            value={editingSlide.name}
                            onChange={(e) => updateEditingSlide('name', e.target.value)}
                            placeholder="e.g., Pyramids of Giza"
                          />
                        </div>

                        <div className="form-row">
                          <label>Image URL (Optional):</label>
                          <input
                            type="url"
                            value={editingSlide.image && !editingSlide.image.startsWith('data:') ? editingSlide.image : ''}
                            onChange={(e) => updateEditingSlide('image', e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                          />
                          <small>Paste an image URL or upload a file below. Leave blank to show gradient only.</small>
                        </div>

                        <div className="form-row">
                          <label>Or Upload Photo:</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSlidePhotoUpload}
                            className="file-input"
                          />
                          <small>Upload an image file (max 5MB). Supported: JPG, PNG, WebP</small>
                          {editingSlide.image && (
                            <div className="photo-preview-container">
                              <img
                                src={editingSlide.image}
                                alt="Slide preview"
                                className="photo-preview"
                              />
                              <button
                                type="button"
                                className="btn-remove-photo"
                                onClick={() => updateEditingSlide('image', '')}
                              >
                                ✕ Remove Photo
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="form-actions">
                          <button className="btn-save" onClick={saveSlide}>Save Slide</button>
                          <button className="btn-cancel" onClick={cancelEditSlide}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      // VIEW MODE
                      <div className="tour-view">
                        <div className="tour-header">
                          <h3>{slide.name}</h3>
                        </div>
                        {slide.image ? (
                          <div className="tour-photo-preview">
                            <img src={slide.image} alt={slide.name} className="tour-photo-preview-image" />
                          </div>
                        ) : (
                          <div
                            style={{
                              height: '80px',
                              borderRadius: '8px',
                              background: slide.gradient,
                              marginBottom: '10px'
                            }}
                          />
                        )}
                        <div className="tour-actions">
                          <button className="btn-edit" onClick={() => startEditSlide(slide)}>
                            ✏️ Edit
                          </button>
                          <button className="btn-delete" onClick={() => deleteSlide(slide.id)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* TOURS TAB */}
        {activeTab === 'tours' && (
          <div className="tours-section">
            <div className="section-header-with-action">
              <h2>Manage Tours</h2>
              <button className="btn-add" onClick={addNewTour}>
                ➕ Add New Tour
              </button>
            </div>
            <p className="section-description">Create, edit, and manage tour packages</p>
            
            <div className="tours-list">
              {tours.map(tour => (
                <div key={tour.id} className="tour-admin-card">
                  {editingTourId === tour.id ? (
                    // EDIT MODE
                    <div className="tour-edit-form">
                      <h3>Editing: {tour.name}</h3>
                      
                      <div className="form-row">
                        <label>Tour Name:</label>
                        <input 
                          type="text" 
                          value={editingTour.name}
                          onChange={(e) => updateEditingTour('name', e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <label>Price:</label>
                        <input 
                          type="text" 
                          value={editingTour.price}
                          onChange={(e) => updateEditingTour('price', e.target.value)}
                          placeholder="e.g., $199"
                        />
                      </div>

                      <div className="form-row">
                        <label>Duration:</label>
                        <input 
                          type="text" 
                          value={editingTour.duration}
                          onChange={(e) => updateEditingTour('duration', e.target.value)}
                          placeholder="e.g., 4 hours"
                        />
                      </div>

                      <div className="form-row">
                        <label>Group Size:</label>
                        <input 
                          type="text" 
                          value={editingTour.groupSize}
                          onChange={(e) => updateEditingTour('groupSize', e.target.value)}
                          placeholder="e.g., 2-10 people"
                        />
                      </div>

                      <div className="form-row">
                        <label>Rating (0-5):</label>
                        <input 
                          type="number" 
                          step="0.1"
                          min="0"
                          max="5"
                          value={editingTour.rating}
                          onChange={(e) => updateEditingTour('rating', parseFloat(e.target.value))}
                        />
                      </div>

                      <div className="form-row">
                        <label>Number of Reviews:</label>
                        <input 
                          type="number" 
                          value={editingTour.reviews}
                          onChange={(e) => updateEditingTour('reviews', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="form-row">
                        <label>Icon Emoji:</label>
                        <input 
                          type="text" 
                          value={editingTour.image}
                          onChange={(e) => updateEditingTour('image', e.target.value)}
                          placeholder="e.g., 🏛️"
                        />
                        <small>Visit <a href="https://emojipedia.org" target="_blank" rel="noopener noreferrer">emojipedia.org</a> to find emojis</small>
                      </div>

                      <div className="form-row">
                        <label>Photo URL (Optional):</label>
                        <input 
                          type="url" 
                          value={editingTour.photoUrl && !editingTour.photoUrl.startsWith('data:') ? editingTour.photoUrl : ''}
                          onChange={(e) => updateEditingTour('photoUrl', e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                        <small>Enter an image URL or upload a file below. Leave blank to use emoji icon.</small>
                      </div>

                      <div className="form-row">
                        <label>Or Upload Photo:</label>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleTourPhotoUpload}
                          className="file-input"
                        />
                        <small>Upload an image file (max 5MB). Supported formats: JPG, PNG, GIF, WebP</small>
                        {editingTour.photoUrl && (
                          <div className="photo-preview-container">
                            <img 
                              src={editingTour.photoUrl} 
                              alt="Tour preview" 
                              className="photo-preview"
                            />
                            <button 
                              type="button"
                              className="btn-remove-photo"
                              onClick={() => updateEditingTour('photoUrl', '')}
                            >
                              ✕ Remove Photo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-row">
                        <label>Description:</label>
                        <textarea 
                          value={editingTour.description}
                          onChange={(e) => updateEditingTour('description', e.target.value)}
                          rows="4"
                        />
                      </div>

                      <div className="form-actions">
                        <button className="btn-save" onClick={saveTour}>Save Changes</button>
                        <button className="btn-cancel" onClick={cancelEditTour}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE
                    <div className="tour-view">
                      <div className="tour-header">
                        <span className="tour-icon">{tour.image}</span>
                        <h3>{tour.name}</h3>
                        <span className="tour-price">{tour.price}</span>
                      </div>
                      <p className="tour-details">
                        ⏱️ {tour.duration} | 👥 {tour.groupSize} | ⭐ {tour.rating} ({tour.reviews} reviews)
                      </p>
                      <p className="tour-description">{tour.description}</p>
                      {tour.photoUrl && (
                        <div className="tour-photo-preview">
                          <img src={tour.photoUrl} alt={tour.name} className="tour-photo-preview-image" />
                        </div>
                      )}
                      <div className="tour-actions">
                        <button className="btn-edit" onClick={() => startEditTour(tour)}>
                          ✏️ Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteTour(tour.id)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOGS TAB */}
        {activeTab === 'blogs' && (
          <div className="blogs-section">
            <div className="section-header-with-action">
              <h2>Manage Blogs</h2>
              <button className="btn-add" onClick={addNewBlog}>
                ➕ Add New Blog
              </button>
            </div>
            <p className="section-description">Create and edit blog posts</p>
            
            <div className="blogs-list">
              {blogs.map(blog => (
                <div key={blog.id} className="blog-admin-card">
                  {editingBlogId === blog.id ? (
                    // EDIT MODE
                    <div className="blog-edit-form">
                      <h3>Editing Blog</h3>
                      
                      <div className="form-row">
                        <label>Title:</label>
                        <input 
                          type="text" 
                          value={editingBlog.title}
                          onChange={(e) => updateEditingBlog('title', e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <label>Author:</label>
                        <input 
                          type="text" 
                          value={editingBlog.author}
                          onChange={(e) => updateEditingBlog('author', e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <label>Date:</label>
                        <input 
                          type="date" 
                          value={editingBlog.date}
                          onChange={(e) => updateEditingBlog('date', e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <label>Category:</label>
                        <input 
                          type="text" 
                          value={editingBlog.category}
                          onChange={(e) => updateEditingBlog('category', e.target.value)}
                          placeholder="e.g., Travel Tips, Food & Culture"
                        />
                      </div>

                      <div className="form-row">
                        <label>Icon Emoji:</label>
                        <input 
                          type="text" 
                          value={editingBlog.image}
                          onChange={(e) => updateEditingBlog('image', e.target.value)}
                          placeholder="e.g., 📝"
                        />
                      </div>

                      <div className="form-row">
                        <label>Excerpt (Short Summary):</label>
                        <textarea 
                          value={editingBlog.excerpt}
                          onChange={(e) => updateEditingBlog('excerpt', e.target.value)}
                          rows="2"
                        />
                      </div>

                      <div className="form-row">
                        <label>Full Content:</label>
                        <textarea 
                          value={editingBlog.content}
                          onChange={(e) => updateEditingBlog('content', e.target.value)}
                          rows="8"
                        />
                      </div>

                      <div className="form-row">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={editingBlog.featured}
                            onChange={(e) => updateEditingBlog('featured', e.target.checked)}
                          />
                          {' '}Featured Blog
                        </label>
                      </div>

                      <div className="form-actions">
                        <button className="btn-save" onClick={saveBlog}>Save Blog</button>
                        <button className="btn-cancel" onClick={cancelEditBlog}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE
                    <div className="blog-view">
                      <div className="blog-header">
                        <span className="blog-icon">{blog.image}</span>
                        <div>
                          <h3>{blog.title}</h3>
                          <p className="blog-meta">
                            By {blog.author} | {blog.date} | {blog.category}
                            {blog.featured && <span className="featured-badge">⭐ Featured</span>}
                          </p>
                        </div>
                      </div>
                      <p className="blog-excerpt">{blog.excerpt}</p>
                      <div className="blog-actions">
                        <button className="btn-edit" onClick={() => startEditBlog(blog)}>
                          ✏️ Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteBlog(blog.id)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="gallery-section">
            <div className="section-header-with-action">
              <h2>Manage Gallery</h2>
              <button className="btn-add" onClick={addNewGalleryItem}>
                ➕ Add New Image
              </button>
            </div>
            <p className="section-description">Upload and manage gallery images</p>
            
            <div className="gallery-grid">
              {gallery.map(item => (
                <div key={item.id} className="gallery-admin-card">
                  {editingGalleryId === item.id ? (
                    // EDIT MODE
                    <div className="gallery-edit-form">
                      <h3>Edit Image</h3>
                      
                      <div className="form-row">
                        <label>Title:</label>
                        <input 
                          type="text" 
                          value={editingGalleryItem.title}
                          onChange={(e) => updateEditingGalleryItem('title', e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <label>Description:</label>
                        <textarea 
                          value={editingGalleryItem.description}
                          onChange={(e) => updateEditingGalleryItem('description', e.target.value)}
                          rows="2"
                        />
                      </div>

                      <div className="form-row">
                        <label>Image URL:</label>
                        <input 
                          type="url" 
                          value={editingGalleryItem.imageUrl}
                          onChange={(e) => updateEditingGalleryItem('imageUrl', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                        <small>Use Unsplash, Imgur, or your own hosted image URL</small>
                      </div>

                      <div className="form-row">
                        <label>Category:</label>
                        <input 
                          type="text" 
                          value={editingGalleryItem.category}
                          onChange={(e) => updateEditingGalleryItem('category', e.target.value)}
                          placeholder="e.g., Pyramids, Temples, Nile River"
                        />
                      </div>

                      <div className="form-row">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={editingGalleryItem.featured}
                            onChange={(e) => updateEditingGalleryItem('featured', e.target.checked)}
                          />
                          {' '}Featured Image
                        </label>
                      </div>

                      <div className="form-actions">
                        <button className="btn-save" onClick={saveGalleryItem}>Save</button>
                        <button className="btn-cancel" onClick={cancelEditGallery}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE
                    <div className="gallery-view">
                      <img src={item.imageUrl} alt={item.title} className="gallery-preview" />
                      <div className="gallery-info">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                        <p className="gallery-meta">
                          {item.category}
                          {item.featured && <span className="featured-badge">⭐</span>}
                        </p>
                        <div className="gallery-actions">
                          <button className="btn-edit" onClick={() => startEditGallery(item)}>
                            ✏️ Edit
                          </button>
                          <button className="btn-delete" onClick={() => deleteGalleryItem(item.id)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Booking Management</h2>
            <p className="section-description">View and manage tour bookings</p>
            
            <div className="bookings-stats">
              <div className="stat-card">
                <h3>{bookings.filter(b => b.status === 'confirmed').length}</h3>
                <p>Confirmed</p>
              </div>
              <div className="stat-card">
                <h3>{bookings.filter(b => b.status === 'pending').length}</h3>
                <p>Pending</p>
              </div>
              <div className="stat-card">
                <h3>{bookings.length}</h3>
                <p>Total Bookings</p>
              </div>
            </div>
            
            <div className="bookings-list">
              {bookings.map(booking => (
                <div key={booking.id} className={`booking-card status-${booking.status}`}>
                  <div className="booking-header">
                    <h3>{booking.tourName}</h3>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="label">Customer:</span>
                      <span>{booking.customerName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span>{booking.customerEmail}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Phone:</span>
                      <span>{booking.customerPhone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Date & Time:</span>
                      <span>{booking.bookingDate} at {booking.bookingTime}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">People:</span>
                      <span>{booking.numberOfPeople} people</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Total Price:</span>
                      <span className="price-highlight">{booking.totalPrice}</span>
                    </div>
                    {booking.specialRequests && (
                      <div className="detail-row">
                        <span className="label">Special Requests:</span>
                        <span>{booking.specialRequests}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="booking-actions">
                    {booking.status === 'pending' && (
                      <button 
                        className="btn-confirm"
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      >
                        ✓ Confirm
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button 
                        className="btn-complete"
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                    <button 
                      className="btn-cancel-booking"
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                    >
                      ✕ Cancel
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => deleteBooking(booking.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {bookings.length === 0 && (
                <div className="no-bookings">
                  <p>No bookings yet. When customers book tours, they will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTACT INFO TAB */}
        {activeTab === 'contact' && (
          <div className="contact-section">
            <h2>Edit Contact Information</h2>
            <p className="section-description">Update your contact details below</p>
            
            <div className="contact-form">
              <div className="form-group">
                <h3>Company Information</h3>
                <div className="form-row">
                  <label>Company Name:</label>
                  <input 
                    type="text" 
                    value={contactInfo.companyName}
                    onChange={(e) => updateContactInfo('companyName', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Tagline:</label>
                  <input 
                    type="text" 
                    value={contactInfo.companyTagline}
                    onChange={(e) => updateContactInfo('companyTagline', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <h3>Email Addresses</h3>
                <div className="form-row">
                  <label>Primary Email:</label>
                  <input 
                    type="email" 
                    value={contactInfo.emailPrimary}
                    onChange={(e) => updateContactInfo('emailPrimary', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Support Email:</label>
                  <input 
                    type="email" 
                    value={contactInfo.emailSupport}
                    onChange={(e) => updateContactInfo('emailSupport', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <h3>Phone Information</h3>
                <div className="form-row">
                  <label>Phone Number:</label>
                  <input 
                    type="tel" 
                    value={contactInfo.phone}
                    onChange={(e) => updateContactInfo('phone', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Availability:</label>
                  <input 
                    type="text" 
                    value={contactInfo.phoneAvailability}
                    onChange={(e) => updateContactInfo('phoneAvailability', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <h3>Address</h3>
                <div className="form-row">
                  <label>City:</label>
                  <input 
                    type="text" 
                    value={contactInfo.address.city}
                    onChange={(e) => updateContactInfo('address.city', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Country:</label>
                  <input 
                    type="text" 
                    value={contactInfo.address.country}
                    onChange={(e) => updateContactInfo('address.country', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Full Address:</label>
                  <input 
                    type="text" 
                    value={contactInfo.address.fullAddress}
                    onChange={(e) => updateContactInfo('address.fullAddress', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <h3>Business Hours</h3>
                <div className="form-row">
                  <label>Weekdays:</label>
                  <input 
                    type="text" 
                    value={contactInfo.businessHours.weekdays}
                    onChange={(e) => updateContactInfo('businessHours.weekdays', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Weekends:</label>
                  <input 
                    type="text" 
                    value={contactInfo.businessHours.weekends}
                    onChange={(e) => updateContactInfo('businessHours.weekends', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <h3>Social Media Links</h3>
                <div className="form-row">
                  <label>Facebook URL:</label>
                  <input 
                    type="url" 
                    value={contactInfo.socialMedia.facebook}
                    onChange={(e) => updateContactInfo('socialMedia.facebook', e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div className="form-row">
                  <label>Instagram URL:</label>
                  <input 
                    type="url" 
                    value={contactInfo.socialMedia.instagram}
                    onChange={(e) => updateContactInfo('socialMedia.instagram', e.target.value)}
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>
                <div className="form-row">
                  <label>Twitter URL:</label>
                  <input 
                    type="url" 
                    value={contactInfo.socialMedia.twitter}
                    onChange={(e) => updateContactInfo('socialMedia.twitter', e.target.value)}
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>
                <div className="form-row">
                  <label>YouTube URL:</label>
                  <input 
                    type="url" 
                    value={contactInfo.socialMedia.youtube}
                    onChange={(e) => updateContactInfo('socialMedia.youtube', e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INSTRUCTIONS TAB */}
        {activeTab === 'instructions' && (
          <div className="instructions-section">
            <h2>📚 How the Full Control Panel Works</h2>
            
            <div className="instruction-card">
              <h3>✨ Automatic Saving</h3>
              <p>This is a <strong>full control panel</strong> - changes are saved automatically!</p>
              <ul>
                <li><strong>Tours</strong>: Click "Save Changes" button after editing</li>
                <li><strong>Contact Info</strong>: Changes save automatically as you type</li>
                <li>No more copy/paste needed!</li>
              </ul>
            </div>

            <div className="instruction-card">
              <h3>🔧 How It Works</h3>
              <ol>
                <li>Make sure the backend server is running (<code>npm run server</code>)</li>
                <li>Edit tours or contact information using the forms</li>
                <li>Changes are saved directly to the data files</li>
                <li>Refresh your website to see the updates</li>
              </ol>
            </div>

            <div className="instruction-card">
              <h3>🚀 Starting the Server</h3>
              <p>The admin panel needs the backend server to save changes. Run from project root:</p>
              <pre className="code-block">npm run server</pre>
              <p>The server should start on port 5000.</p>
            </div>

            <div className="instruction-card warning">
              <h3>⚠️ Important Notes</h3>
              <ul>
                <li>The backend server must be running for automatic saves to work</li>
                <li>If the server is not running, you'll see an error message</li>
                <li>Changes are saved to files immediately - no manual copy/paste needed!</li>
                <li>Refresh the website after saving to see your changes</li>
              </ul>
            </div>

            <div className="instruction-card tip">
              <h3>💡 Pro Tips</h3>
              <ul>
                <li>Watch for the green "saved successfully" message</li>
                <li>If you see errors, check that the server is running</li>
                <li>Changes persist across browser refreshes</li>
                <li>Use this panel for all content updates - it's the easiest way!</li>
              </ul>
            </div>
          </div>
        )}

        {/* TESTIMONIALS TAB */}
        {activeTab === 'testimonials' && (
          <div className="testimonials-admin-section">
            <div className="section-header-with-action">
              <div>
                <h2>Manage Customer Testimonials</h2>
                <p className="section-description">Add, edit, and remove customer reviews shown on the homepage.</p>
              </div>
              <button className="btn-add" onClick={addNewTestimonial}>
                ➕ Add Testimonial
              </button>
            </div>

            <div className="tours-list">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="tour-admin-card">
                  {editingTestimonialIndex === index ? (
                    // EDIT MODE
                    <div className="tour-edit-form">
                      <h3>Editing Testimonial</h3>
                      <div className="form-row">
                        <label>Customer Name:</label>
                        <input
                          type="text"
                          value={editingTestimonial.name}
                          onChange={(e) => updateEditingTestimonial('name', e.target.value)}
                        />
                      </div>
                      <div className="form-row">
                        <label>Country / Location:</label>
                        <input
                          type="text"
                          value={editingTestimonial.country}
                          onChange={(e) => updateEditingTestimonial('country', e.target.value)}
                          placeholder="e.g., USA, UK, Germany"
                        />
                      </div>
                      <div className="form-row">
                        <label>Review Text:</label>
                        <textarea
                          value={editingTestimonial.text}
                          onChange={(e) => updateEditingTestimonial('text', e.target.value)}
                          rows="4"
                          placeholder="Enter the customer's review..."
                        />
                      </div>
                      <div className="form-actions">
                        <button className="btn-save" onClick={saveTestimonial}>Save</button>
                        <button className="btn-cancel" onClick={cancelEditTestimonial}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE
                    <div className="testimonial-view">
                      <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                      <p className="testimonial-quote">"{testimonial.text}"</p>
                      <div className="testimonial-author">
                        <strong>{testimonial.name}</strong>
                        <span>{testimonial.country}</span>
                      </div>
                      <div className="tour-actions">
                        <button className="btn-edit" onClick={() => startEditTestimonial(index)}>
                          ✏️ Edit
                        </button>
                        <button className="btn-delete" onClick={() => deleteTestimonial(index)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SITE SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            <p className="section-description">
              Edit the main text and numbers shown on your homepage. Click Save Settings when done.
            </p>

            <div className="form-group">
              <h3>🦸 Hero Section</h3>
              <div className="form-row">
                <label>Badge / Tag Text:</label>
                <input
                  type="text"
                  value={siteSettings.hero?.badge || ''}
                  onChange={(e) => updateSiteSettingsHero('badge', e.target.value)}
                  placeholder="e.g., 🌟 Premium Travel Experiences"
                />
              </div>
              <div className="form-row">
                <label>Main Headline:</label>
                <input
                  type="text"
                  value={siteSettings.hero?.title || ''}
                  onChange={(e) => updateSiteSettingsHero('title', e.target.value)}
                  placeholder="e.g., Discover the Wonders of Ancient Egypt"
                />
              </div>
              <div className="form-row">
                <label>Subtitle / Description:</label>
                <textarea
                  rows="3"
                  value={siteSettings.hero?.subtitle || ''}
                  onChange={(e) => updateSiteSettingsHero('subtitle', e.target.value)}
                  placeholder="Enter the hero section subtitle..."
                />
              </div>
              <div className="form-row">
                <label>Primary Button Text:</label>
                <input
                  type="text"
                  value={siteSettings.hero?.primaryButtonText || ''}
                  onChange={(e) => updateSiteSettingsHero('primaryButtonText', e.target.value)}
                  placeholder="e.g., Explore Tours"
                />
              </div>
              <div className="form-row">
                <label>Secondary Button Text:</label>
                <input
                  type="text"
                  value={siteSettings.hero?.secondaryButtonText || ''}
                  onChange={(e) => updateSiteSettingsHero('secondaryButtonText', e.target.value)}
                  placeholder="e.g., Plan My Trip"
                />
              </div>
            </div>

            <div className="form-group">
              <h3>📊 Stats Section</h3>
              <p style={{ color: '#666', marginTop: 0, marginBottom: '20px' }}>
                These appear as the 4 highlight numbers below the hero section.
              </p>
              {(siteSettings.stats || []).map((stat, index) => (
                <div key={index} className="stat-edit-row">
                  <div className="form-row">
                    <label>Stat {index + 1} — Value:</label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => updateSiteSettingsStat(index, 'value', e.target.value)}
                      placeholder="e.g., 5000+"
                    />
                  </div>
                  <div className="form-row">
                    <label>Stat {index + 1} — Label:</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateSiteSettingsStat(index, 'label', e.target.value)}
                      placeholder="e.g., Happy Travelers"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-save" style={{ minWidth: '180px' }} onClick={saveSiteSettingsToServer}>
              💾 Save Settings
            </button>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
