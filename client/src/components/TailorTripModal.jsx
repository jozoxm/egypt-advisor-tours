import React, { useEffect, useMemo, useState } from 'react';
import emailjs from '@emailjs/browser';
import { getTailorTrip } from '../api/cms';
import { fallbackTailorTrip } from '../data/cms-fallbacks';

// EmailJS configuration — set in .env.production / hosting panel.
const EMAILJS_SERVICE_ID         = process.env.REACT_APP_EMAILJS_SERVICE_ID          || '';
const EMAILJS_TRIPTAILOR_TEMPLATE = process.env.REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY         = process.env.REACT_APP_EMAILJS_PUBLIC_KEY           || '';

const normalizeOptions = (options, fallbackOptions) => {
  if (!Array.isArray(options) || options.length === 0) {
    return fallbackOptions;
  }

  return options
    .map((option) => {
      if (typeof option === 'string') {
        return { value: option.toLowerCase().replace(/\s+/g, '-'), label: option };
      }
      return {
        value: option?.value || option?.label || '',
        label: option?.label || option?.value || '',
      };
    })
    .filter((option) => option.value && option.label);
};

const TailorTripModal = ({ isOpen, onClose, contactInfo }) => {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage]       = useState('');
  const [tailorTripContent, setTailorTripContent] = useState(fallbackTailorTrip);

  useEffect(() => {
    let isMounted = true;

    getTailorTrip()
      .then((data) => {
        if (!isMounted || !data || typeof data !== 'object') return;
        setTailorTripContent((prev) => ({
          ...prev,
          ...data,
          hero: data.hero && typeof data.hero === 'object' ? { ...prev.hero, ...data.hero } : prev.hero,
          form: data.form && typeof data.form === 'object'
            ? {
                ...prev.form,
                ...data.form,
                fields: data.form.fields && typeof data.form.fields === 'object'
                  ? { ...prev.form.fields, ...data.form.fields }
                  : prev.form.fields,
              }
            : prev.form,
          contactBlock: data.contactBlock && typeof data.contactBlock === 'object'
            ? { ...prev.contactBlock, ...data.contactBlock }
            : prev.contactBlock,
          highlights: Array.isArray(data.highlights) && data.highlights.length > 0 ? data.highlights : prev.highlights,
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const formFields = tailorTripContent?.form?.fields || fallbackTailorTrip.form.fields;
  const travelStyleOptions = useMemo(
    () => normalizeOptions(formFields?.travelStyle?.options, fallbackTailorTrip.form.fields.travelStyle.options),
    [formFields?.travelStyle?.options]
  );
  const accommodationOptions = useMemo(
    () => normalizeOptions(formFields?.accommodation?.options, fallbackTailorTrip.form.fields.accommodation.options),
    [formFields?.accommodation?.options]
  );
  const paceOptions = useMemo(
    () => normalizeOptions(formFields?.pace?.options, fallbackTailorTrip.form.fields.pace.options),
    [formFields?.pace?.options]
  );
  const budgetOptions = useMemo(
    () => normalizeOptions(formFields?.budget?.options, fallbackTailorTrip.form.fields.budget.options),
    [formFields?.budget?.options]
  );
  const languageOptions = useMemo(
    () => normalizeOptions(formFields?.language?.options, fallbackTailorTrip.form.fields.language.options),
    [formFields?.language?.options]
  );
  const interestOptions = useMemo(
    () => normalizeOptions(formFields?.interests?.options, fallbackTailorTrip.form.fields.interests.options),
    [formFields?.interests?.options]
  );
  const interestFieldNames = ['interestHistory', 'interestNile', 'interestRedSea', 'interestFood', 'interestDesert', 'interestFamily'];
  const interestSelections = interestOptions.slice(0, interestFieldNames.length).map((option, index) => ({
    field: interestFieldNames[index],
    label: option.label,
  }));

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const fd = new FormData(e.target);
    const interests = interestSelections
      .filter((item) => fd.get(item.field))
      .map((item) => item.label)
      .join(', ') || 'Not specified';

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
            <h2>{tailorTripContent?.hero?.title || fallbackTailorTrip.hero.title}</h2>
            <p>{tailorTripContent?.hero?.subtitle || fallbackTailorTrip.hero.subtitle}</p>
            <ul className="trip-highlights">
              {(Array.isArray(tailorTripContent?.highlights) ? tailorTripContent.highlights : fallbackTailorTrip.highlights).map((highlight, index) => (
                <li key={`${highlight}-${index}`}>{highlight}</li>
              ))}
            </ul>
            <div className="trip-contact">
              {tailorTripContent?.contactBlock?.title ? <strong>{tailorTripContent.contactBlock.title}</strong> : null}
              {tailorTripContent?.contactBlock?.description ? <span>{tailorTripContent.contactBlock.description}</span> : null}
              <span>{tailorTripContent?.contactBlock?.emailLabel || fallbackTailorTrip.contactBlock.emailLabel}: {contactInfo.emailPrimary}</span>
              <span>{tailorTripContent?.contactBlock?.phoneLabel || fallbackTailorTrip.contactBlock.phoneLabel}: {contactInfo.phone}</span>
            </div>
          </div>

          <form className="trip-tailor-form" onSubmit={handleSubmit}>
            <h3>{tailorTripContent?.form?.title || fallbackTailorTrip.form.title}</h3>
            <div className="form-row">
              <input
                name="fullName"
                type="text"
                placeholder={formFields?.fullName?.placeholder || fallbackTailorTrip.form.fields.fullName.placeholder}
                aria-label={formFields?.fullName?.label || fallbackTailorTrip.form.fields.fullName.label}
                required
              />
              <input
                name="email"
                type="email"
                placeholder={formFields?.email?.placeholder || fallbackTailorTrip.form.fields.email.placeholder}
                aria-label={formFields?.email?.label || fallbackTailorTrip.form.fields.email.label}
                required
              />
            </div>
            <div className="form-row">
              <input
                name="phone"
                type="tel"
                placeholder={formFields?.phone?.placeholder || fallbackTailorTrip.form.fields.phone.placeholder}
                aria-label={formFields?.phone?.label || fallbackTailorTrip.form.fields.phone.label}
                required
              />
              <label className="checkbox-item inline-checkbox">
                <input
                  name="whatsapp"
                  type="checkbox"
                  defaultChecked
                  aria-label={formFields?.whatsapp?.label || fallbackTailorTrip.form.fields.whatsapp.label}
                /> {formFields?.whatsapp?.label || fallbackTailorTrip.form.fields.whatsapp.label}
              </label>
            </div>
            <div className="form-row">
              <input
                name="travelDates"
                type="text"
                placeholder={formFields?.travelDates?.placeholder || fallbackTailorTrip.form.fields.travelDates.placeholder}
                aria-label={formFields?.travelDates?.label || fallbackTailorTrip.form.fields.travelDates.label}
                required
              />
              <input
                name="travelers"
                type="number"
                min="1"
                max="50"
                placeholder={formFields?.travelers?.placeholder || fallbackTailorTrip.form.fields.travelers.placeholder}
                aria-label={formFields?.travelers?.label || fallbackTailorTrip.form.fields.travelers.label}
                required
              />
            </div>
            <div className="form-row">
              <select
                name="travelStyle"
                aria-label={formFields?.travelStyle?.label || fallbackTailorTrip.form.fields.travelStyle.label}
                defaultValue="placeholder"
                required
              >
                <option value="placeholder" disabled hidden>{formFields?.travelStyle?.placeholder || fallbackTailorTrip.form.fields.travelStyle.placeholder}</option>
                {travelStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                name="accommodation"
                aria-label={formFields?.accommodation?.label || fallbackTailorTrip.form.fields.accommodation.label}
                defaultValue="placeholder"
                required
              >
                <option value="placeholder" disabled hidden>
                  {formFields?.accommodation?.placeholder || fallbackTailorTrip.form.fields.accommodation.placeholder}
                </option>
                {accommodationOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group checkbox-group">
              <span className="field-label">{formFields?.interests?.label || fallbackTailorTrip.form.fields.interests.label}</span>
              <div className="options-grid spacious-options">
                {interestOptions.slice(0, interestFieldNames.length).map((option, index) => (
                  <label className="checkbox-item" key={`${option.value}-${index}`}>
                    <input name={interestFieldNames[index]} type="checkbox" />
                    {' '}
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row">
              <select
                name="pace"
                aria-label={formFields?.pace?.label || fallbackTailorTrip.form.fields.pace.label}
                defaultValue="placeholder"
                required
              >
                <option value="placeholder" disabled hidden>
                  {formFields?.pace?.placeholder || fallbackTailorTrip.form.fields.pace.placeholder}
                </option>
                {paceOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                name="budget"
                aria-label={formFields?.budget?.label || fallbackTailorTrip.form.fields.budget.label}
                defaultValue="placeholder"
                required
              >
                <option value="placeholder" disabled hidden>
                  {formFields?.budget?.placeholder || fallbackTailorTrip.form.fields.budget.placeholder}
                </option>
                {budgetOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <input
                name="mustSee"
                type="text"
                placeholder={formFields?.destinations?.placeholder || fallbackTailorTrip.form.fields.destinations.placeholder}
                aria-label={formFields?.destinations?.label || fallbackTailorTrip.form.fields.destinations.label}
              />
              <select
                name="language"
                aria-label={formFields?.language?.label || fallbackTailorTrip.form.fields.language.label}
                defaultValue="placeholder"
              >
                <option value="placeholder" disabled hidden>
                  {formFields?.language?.placeholder || fallbackTailorTrip.form.fields.language.placeholder}
                </option>
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <textarea
                name="notes"
                placeholder={formFields?.notes?.placeholder || fallbackTailorTrip.form.fields.notes.placeholder}
                aria-label={formFields?.notes?.label || fallbackTailorTrip.form.fields.notes.label}
                rows="4"
                required
              ></textarea>
            </div>
            {message === 'success' && (
              <div className="trip-tailor-success" role="alert">
                {tailorTripContent?.form?.successMessage || fallbackTailorTrip.form.successMessage}
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
              {submitting
                ? 'Sending…'
                : message === 'success'
                  ? 'Sent ✓'
                  : (tailorTripContent?.form?.submitLabel || fallbackTailorTrip.form.submitLabel)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TailorTripModal;
