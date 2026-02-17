import React, { useState } from 'react';
import { tours as initialTours } from '../data/tours-data';
import { contactInfo as initialContactInfo } from '../data/contact-info';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('tours');
  const [tours, setTours] = useState(initialTours);
  const [contactInfo, setContactInfo] = useState(initialContactInfo);
  const [editingTourId, setEditingTourId] = useState(null);
  const [editingTour, setEditingTour] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Handle tour editing
  const startEditTour = (tour) => {
    setEditingTourId(tour.id);
    setEditingTour({ ...tour });
  };

  const cancelEditTour = () => {
    setEditingTourId(null);
    setEditingTour(null);
  };

  const saveTour = () => {
    const updatedTours = tours.map(tour => 
      tour.id === editingTour.id ? editingTour : tour
    );
    setTours(updatedTours);
    setEditingTourId(null);
    setEditingTour(null);
    showSaveMessage('Tour updated! (Note: Changes are temporary until you copy the code below)');
  };

  const updateEditingTour = (field, value) => {
    setEditingTour({ ...editingTour, [field]: value });
  };

  // Handle contact info editing
  const updateContactInfo = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setContactInfo({
        ...contactInfo,
        [parent]: {
          ...contactInfo[parent],
          [child]: value
        }
      });
    } else {
      setContactInfo({ ...contactInfo, [field]: value });
    }
    showSaveMessage('Contact info updated! (Note: Changes are temporary until you copy the code below)');
  };

  const showSaveMessage = (message) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 5000);
  };

  // Generate code to copy
  const generateToursCode = () => {
    return `export const tours = ${JSON.stringify(tours, null, 2)};`;
  };

  const generateContactCode = () => {
    return `export const contactInfo = ${JSON.stringify(contactInfo, null, 2)};`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showSaveMessage(`${type} code copied to clipboard! Now paste it into the corresponding file.`);
      })
      .catch((err) => {
        showSaveMessage(`Failed to copy code. Please manually select and copy the code below. Error: ${err.message}`);
      });
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🎨 Admin Panel - No Coding Required!</h1>
        <p>Edit your website content using simple forms below</p>
      </div>

      {saveMessage && (
        <div className="save-message">
          ✓ {saveMessage}
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
          📚 How to Save Changes
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

            <div className="code-output">
              <h3>📋 Step 2: Copy This Code</h3>
              <p>After editing, copy the code below and paste it into: <code>client/src/data/tours-data.js</code></p>
              <button className="btn-copy" onClick={() => copyToClipboard(generateToursCode(), 'Tours')}>
                📋 Copy Tours Code
              </button>
              <pre className="code-block">{generateToursCode()}</pre>
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

            <div className="code-output">
              <h3>📋 Step 2: Copy This Code</h3>
              <p>After editing, copy the code below and paste it into: <code>client/src/data/contact-info.js</code></p>
              <button className="btn-copy" onClick={() => copyToClipboard(generateContactCode(), 'Contact Info')}>
                📋 Copy Contact Info Code
              </button>
              <pre className="code-block">{generateContactCode()}</pre>
            </div>
          </div>
        )}

        {/* INSTRUCTIONS TAB */}
        {activeTab === 'instructions' && (
          <div className="instructions-section">
            <h2>📚 How to Save Your Changes</h2>
            
            <div className="instruction-card">
              <h3>Step 1: Edit Using Forms</h3>
              <ol>
                <li>Go to the "Edit Tours" or "Edit Contact Info" tab</li>
                <li>Make your changes using the forms</li>
                <li>Click the "Copy Code" button at the bottom</li>
              </ol>
            </div>

            <div className="instruction-card">
              <h3>Step 2: Paste Into the Data File</h3>
              <ol>
                <li>Open your text editor (VS Code, Notepad++, etc.)</li>
                <li><strong>For tours:</strong> Open <code>client/src/data/tours-data.js</code></li>
                <li><strong>For contact info:</strong> Open <code>client/src/data/contact-info.js</code></li>
                <li>Select ALL the existing code (Ctrl+A or Cmd+A)</li>
                <li>Paste the copied code (Ctrl+V or Cmd+V)</li>
                <li>Save the file (Ctrl+S or Cmd+S)</li>
              </ol>
            </div>

            <div className="instruction-card">
              <h3>Step 3: See Your Changes</h3>
              <ol>
                <li>If the website is already running, refresh your browser</li>
                <li>If not, run: <code>npm start</code> from the project root</li>
                <li>Your changes will appear on the website!</li>
              </ol>
            </div>

            <div className="instruction-card warning">
              <h3>⚠️ Important Notes</h3>
              <ul>
                <li>Changes in this admin panel are <strong>temporary</strong> - they won't save automatically</li>
                <li>You MUST copy the code and paste it into the actual data files</li>
                <li>Always keep a backup of your working files before making changes</li>
                <li>Test changes on a local copy before updating your live website</li>
              </ul>
            </div>

            <div className="instruction-card tip">
              <h3>💡 Pro Tips</h3>
              <ul>
                <li>Make small changes and test them one at a time</li>
                <li>Use this admin panel to preview changes before saving</li>
                <li>Keep your browser's developer console open to catch any errors</li>
                <li>If something breaks, just paste back your backup code</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
