import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

// EmailJS configuration — set in .env.production / hosting panel.
const EMAILJS_SERVICE_ID         = process.env.REACT_APP_EMAILJS_SERVICE_ID          || '';
const EMAILJS_TRIPTAILOR_TEMPLATE = process.env.REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY         = process.env.REACT_APP_EMAILJS_PUBLIC_KEY           || '';

const TailorTripModal = ({ isOpen, onClose, contactInfo }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const fd = new FormData(e.target);
    const interests = [
      fd.get('interestHistory') ? 'Ancient history & temples' : '',
      fd.get('interestNile')    ? 'Nile cruise' : '',
      fd.get('interestRedSea')  ? 'Red Sea beaches & diving' : '',
      fd.get('interestFood')    ? 'Food & culinary' : '',
      fd.get('interestDesert')  ? 'Desert adventures' : '',
      fd.get('interestFamily')  ? 'Family-friendly' : '',
    ].filter(Boolean).join(', ') || 'Not specified';

    const templateParams = {
      full_name:     fd.get('fullName'),
      email:         fd.get('email'),
      phone:         fd.get('phone'),
      whatsapp:      fd.get('whatsapp') ? 'Yes' : 'No',
      travel_dates:  fd.get('travelDates'),
      travelers:     fd.get('travelers'),
      travel_style:  fd.get('travelStyle'),
      accommodation: fd.get('accommodation'),
      interests,
      pace:          fd.get('pace'),
      budget:        fd.get('budget'),
      must_see:      fd.get('mustSee')  || 'Not specified',
      language:      fd.get('language') || 'Not specified',
      notes:         fd.get('notes'),
    };

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TRIPTAILOR_TEMPLATE || !EMAILJS_PUBLIC_KEY) {
      console.warn('EmailJS is not configured for TailorTrip. Set REACT_APP_EMAILJS_* env vars.');
      console.info('Trip Tailor enquiry:', templateParams);
      setMessage('error');
    } else {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TRIPTAILOR_TEMPLATE, templateParams, EMAILJS_PUBLIC_KEY);
        setMessage('success');
      } catch (err) {
        console.error('EmailJS error:', err);
        setMessage('error');
      }
    }
    setSubmitting(false);
  };

  return (
    <div
      className="trip-tailor-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Tailor your Egypt trip"
      onClick={onClose}
    >
      <div className="trip-tailor-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Close trip tailor form">✕</button>
        <div className="trip-tailor-grid">
          <div className="trip-tailor-copy">
            <h2>Tailor Your Egypt Journey</h2>
            <p>Share your dream experiences and we'll craft a bespoke itinerary with expert Egyptologists, luxury stays, and seamless logistics.</p>
            <ul className="trip-highlights">
              <li>✔️ Private guides & skip-the-line access</li>
              <li>✔️ Handpicked stays in Cairo, Luxor, Aswan & the Red Sea</li>
              <li>✔️ Flexible pace with cultural, culinary, and family-friendly options</li>
            </ul>
            <div className="trip-contact">
              <span>📧 {contactInfo.emailPrimary}</span>
              <span>📞 {contactInfo.phone}</span>
            </div>
          </div>

          <form className="trip-tailor-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input name="fullName" type="text" placeholder="Full Name" aria-label="Full Name" required />
              <input name="email" type="email" placeholder="Email Address" aria-label="Email Address" required />
            </div>
            <div className="form-row">
              <input
                name="phone"
                type="tel"
                placeholder="+20 123 456 7890 (WhatsApp)"
                aria-label="Phone number (international format)"
                required
              />
              <label className="checkbox-item inline-checkbox">
                <input name="whatsapp" type="checkbox" defaultChecked aria-label="WhatsApp" /> WhatsApp
              </label>
            </div>
            <div className="form-row">
              <input
                name="travelDates"
                type="text"
                placeholder="Preferred travel dates or month (e.g., Oct 2026)"
                aria-label="Preferred travel dates or month"
                required
              />
              <input
                name="travelers"
                type="number"
                min="1"
                max="50"
                placeholder="Number of travelers"
                aria-label="Number of travelers"
                required
              />
            </div>
            <div className="form-row">
              <select name="travelStyle" aria-label="Travel style" defaultValue="placeholder" required>
                <option value="placeholder" disabled hidden>Travel style</option>
                <option value="luxury">Luxury & private</option>
                <option value="cultural">Cultural immersion</option>
                <option value="adventure">Adventure & outdoors</option>
                <option value="family">Family friendly</option>
              </select>
              <select name="accommodation" aria-label="Accommodation preference" defaultValue="placeholder" required>
                <option value="placeholder" disabled hidden>Accommodation preference</option>
                <option value="boutique">Boutique & character stays</option>
                <option value="luxury-hotels">Luxury hotels & resorts</option>
                <option value="heritage">Heritage stays & eco-lodges</option>
                <option value="budget">Comfort/budget friendly</option>
              </select>
            </div>
            <div className="form-group checkbox-group">
              <span className="field-label">Travel interests (select all that apply)</span>
              <div className="options-grid spacious-options">
                <label className="checkbox-item"><input name="interestHistory" type="checkbox" /> Ancient history & temples</label>
                <label className="checkbox-item"><input name="interestNile" type="checkbox" /> Nile cruise experiences</label>
                <label className="checkbox-item"><input name="interestRedSea" type="checkbox" /> Red Sea beaches & diving</label>
                <label className="checkbox-item"><input name="interestFood" type="checkbox" /> Food & culinary tours</label>
                <label className="checkbox-item"><input name="interestDesert" type="checkbox" /> Desert adventures & oases</label>
                <label className="checkbox-item"><input name="interestFamily" type="checkbox" /> Family-friendly activities</label>
              </div>
            </div>
            <div className="form-row">
              <select name="pace" aria-label="Preferred trip pace" defaultValue="placeholder" required>
                <option value="placeholder" disabled hidden>Preferred pace</option>
                <option value="relaxed">Relaxed (more downtime)</option>
                <option value="balanced">Balanced (mix of sights & rest)</option>
                <option value="packed">See-it-all (full days)</option>
              </select>
              <select name="budget" aria-label="Budget range" defaultValue="placeholder" required>
                <option value="placeholder" disabled hidden>Budget range</option>
                <option value="premium">Premium (top-tier)</option>
                <option value="mid">Mid-range</option>
                <option value="value">Value-focused</option>
              </select>
            </div>
            <div className="form-row">
              <input name="mustSee" type="text" placeholder="Must-see sites (optional, e.g., Giza, Abu Simbel, Nile cruise)" aria-label="Must-see sites (optional)" />
              <select name="language" aria-label="Guiding language preference" defaultValue="placeholder">
                <option value="placeholder" disabled hidden>Guiding language (optional)</option>
                <option value="english">English</option>
                <option value="arabic">Arabic</option>
                <option value="french">French</option>
                <option value="spanish">Spanish</option>
                <option value="german">German</option>
                <option value="other">Other (share in notes)</option>
              </select>
            </div>
            <div className="form-group">
              <textarea name="notes" placeholder="Tell us about your ideal Egypt trip, interests, and pace." aria-label="Tell us about your ideal Egypt trip, interests, and pace." rows="4" required></textarea>
            </div>
            {message === 'success' && (
              <div className="trip-tailor-success" role="alert">
                ✓ Thank you! We've received your enquiry and will be in touch within 24 hours.
              </div>
            )}
            {message === 'error' && (
              <div className="trip-tailor-error" role="alert">
                ❌ Something went wrong. Please email us directly at {contactInfo.emailPrimary}.
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary submit-button"
              disabled={submitting || message === 'success'}
            >
              {submitting ? 'Sending…' : message === 'success' ? 'Sent ✓' : 'Tailor my trip'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TailorTripModal;
