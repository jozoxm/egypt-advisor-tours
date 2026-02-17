import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('tours');
  const [tours, setTours] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [editingTourId, setEditingTourId] = useState(null);
  const [editingTour, setEditingTour] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [toursRes, contactRes] = await Promise.all([
        fetch(`${API_URL}/api/tours`),
        fetch(`${API_URL}/api/contact`)
      ]);
      
      if (toursRes.ok && contactRes.ok) {
        const toursData = await toursRes.json();
        const contactData = await contactRes.json();
        
        setTours(toursData.tours || []);
        setTestimonials(toursData.testimonials || []);
        setContactInfo(contactData);
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
        setTours(localTours);
        setTestimonials(localTestimonials || []);
        setContactInfo(localContactInfo);
      } catch (importError) {
        showSaveMessage('Failed to load data', 'error');
      }
    }
    setLoading(false);
  };

  // Handle tour editing
  const startEditTour = (tour) => {
    setEditingTourId(tour.id);
    setEditingTour({ ...tour });
  };

  const cancelEditTour = () => {
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

  const showSaveMessage = (message, type = 'info') => {
    setSaveMessage({ text: message, type });
    setTimeout(() => setSaveMessage(''), 5000);
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h1>🎨 Admin Panel - Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🎨 Full Control Admin Panel</h1>
        <p>Edit your website content with automatic saving - no coding required!</p>
        {saving && <p className="saving-indicator">💾 Saving...</p>}
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.type}`}>
          {saveMessage.text}
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={activeTab === 'tours' ? 'active' : ''} 
          onClick={() => setActiveTab('tours')}
        >
          🎫 Edit Tours
        </button>
        <button 
          className={activeTab === 'contact' ? 'active' : ''} 
          onClick={() => setActiveTab('contact')}
        >
          📞 Edit Contact Info
        </button>
        <button 
          className={activeTab === 'instructions' ? 'active' : ''} 
          onClick={() => setActiveTab('instructions')}
        >
          📚 How It Works
        </button>
      </div>

      <div className="admin-content">
        {/* TOURS TAB */}
        {activeTab === 'tours' && (
          <div className="tours-section">
            <h2>Edit Tours</h2>
            <p className="section-description">Click "Edit" on any tour to change its details</p>
            
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
                      <button className="btn-edit" onClick={() => startEditTour(tour)}>
                        ✏️ Edit This Tour
                      </button>
                    </div>
                  )}
                </div>
              ))}
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
      </div>
    </div>
  );
};

export default AdminPanel;
