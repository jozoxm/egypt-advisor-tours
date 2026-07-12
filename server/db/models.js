/**
 * MongoDB Mongoose Schemas for Admin-Managed Content
 * 
 * This file defines schemas for all content types that admins can edit.
 * Each schema includes timestamps, change tracking, and validation.
 */

const mongoose = require('mongoose');

// ============================================================
// SHARED SCHEMA PATTERNS
// ============================================================

const timestampPlugin = {
  timestamps: true, // Adds createdAt, updatedAt
};

const baseContentOptions = {
  ...timestampPlugin,
  collection: 'content',
};

// ============================================================
// TOUR SCHEMA
// ============================================================

const tourSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    category: String,
    price: Number,
    duration: String,
    description: String,
    longDescription: String,
    image: String,
    images: [String],
    highlights: [String],
    itinerary: [
      {
        day: Number,
        title: String,
        description: String,
      },
    ],
    included: [String],
    notIncluded: [String],
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'] },
    groupSize: String,
    bestTime: String,
    testimonials: [
      {
        name: String,
        text: String,
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    isActive: { type: Boolean, default: true },
    lastEditedBy: { type: String, default: 'admin' },
  },
  { collection: 'tours', ...timestampPlugin }
);

// ============================================================
// BLOG SCHEMA
// ============================================================

const blogSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    title: { type: String, required: true },
    slug: String,
    excerpt: String,
    content: String,
    author: String,
    image: String,
    category: String,
    tags: [String],
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    publishedAt: Date,
    lastEditedBy: { type: String, default: 'admin' },
  },
  { collection: 'blogs', ...timestampPlugin }
);

// ============================================================
// BOOKING SCHEMA
// ============================================================

const bookingSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    tourId: { type: Number, required: true },
    tourName: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: String,
    numberOfPeople: { type: Number, required: true },
    bookingDate: Date,
    totalPrice: Number,
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    specialRequests: String,
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  },
  { collection: 'bookings', ...timestampPlugin }
);

// ============================================================
// CONTACT SCHEMA
// ============================================================

const contactSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'contact-info' },
    phone: String,
    email: String,
    address: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    businessHours: {
      weekday: String,
      weekend: String,
    },
    lastEditedBy: { type: String, default: 'admin' },
  },
  { collection: 'contact', ...timestampPlugin }
);

// ============================================================
// DESTINATION SCHEMA
// ============================================================

const destinationSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    slug: String,
    description: String,
    overview: String,
    image: String,
    images: [String],
    attractions: [
      {
        name: String,
        description: String,
      },
    ],
    bestTimeToVisit: String,
    gettingThere: String,
    accommodations: [String],
    restaurants: [String],
    isActive: { type: Boolean, default: true },
    lastEditedBy: { type: String, default: 'admin' },
  },
  { collection: 'destinations', ...timestampPlugin }
);

// ============================================================
// GALLERY SCHEMA
// ============================================================

const gallerySchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    title: String,
    description: String,
    images: [
      {
        url: { type: String, required: true },
        caption: String,
        alt: String,
      },
    ],
    category: String,
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastEditedBy: { type: String, default: 'admin' },
  },
  { collection: 'gallery', ...timestampPlugin }
);

// ============================================================
// PROMOTION SCHEMA
// ============================================================

const promotionSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    title: { type: String, required: true },
    description: String,
    discountPercentage: Number,
    discountAmount: Number,
    code: { type: String, unique: true, sparse: true },
    validFrom: Date,
    validUntil: Date,
    tours: [Number], // Array of tour IDs
    maxUses: Number,
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastEditedBy: { type: String, default: 'admin' },
  },
  { collection: 'promotions', ...timestampPlugin }
);

// ============================================================
// SETTINGS SCHEMA
// ============================================================

const settingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'site-settings' },
    siteName: String,
    siteDescription: String,
    logo: String,
    favicon: String,
    hero: {
      title: String,
      subtitle: String,
      backgroundImage: String,
      ctaText: String,
      ctaLink: String,
    },
    features: [
      {
        title: String,
        description: String,
        icon: String,
      },
    ],
    testimonialsSummary: {
      heading: String,
      subheading: String,
    },
    faq: [
      {
        question: String,
        answer: String,
        category: String,
      },
    ],
    seo: {
      metaDescription: String,
      keywords: [String],
      socialImage: String,
    },
    theme: {
      primaryColor: String,
      secondaryColor: String,
      fontFamily: String,
    },
    lastEditedBy: { type: String, default: 'admin' },
  },
  { collection: 'settings', ...timestampPlugin }
);

// ============================================================
// SLIDESHOW SCHEMA
// ============================================================

const slideshowSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    title: String,
    slides: [
      {
        order: Number,
        title: String,
        description: String,
        image: String,
        link: String,
      },
    ],
    autoplay: { type: Boolean, default: true },
    duration: { type: Number, default: 5000 }, // milliseconds
    isActive: { type: Boolean, default: true },
    lastEditedBy: { type: String, default: 'admin' },
  },
  { collection: 'slideshow', ...timestampPlugin }
);

// ============================================================
// AUDIT LOG SCHEMA - Track all admin changes
// ============================================================

const auditLogSchema = new mongoose.Schema(
  {
    adminUsername: { type: String, required: true },
    action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
    resourceType: { type: String, required: true }, // tours, blogs, settings, etc.
    resourceId: String,
    changes: mongoose.Schema.Types.Mixed, // Stores before/after diff
    ip: String,
    userAgent: String,
  },
  { collection: 'audit_logs', ...timestampPlugin }
);

// ============================================================
// MODEL EXPORTS
// ============================================================

module.exports = {
  Tour: mongoose.model('Tour', tourSchema),
  Blog: mongoose.model('Blog', blogSchema),
  Booking: mongoose.model('Booking', bookingSchema),
  Contact: mongoose.model('Contact', contactSchema),
  Destination: mongoose.model('Destination', destinationSchema),
  Gallery: mongoose.model('Gallery', gallerySchema),
  Promotion: mongoose.model('Promotion', promotionSchema),
  Settings: mongoose.model('Settings', settingsSchema),
  Slideshow: mongoose.model('Slideshow', slideshowSchema),
  AuditLog: mongoose.model('AuditLog', auditLogSchema),
};
