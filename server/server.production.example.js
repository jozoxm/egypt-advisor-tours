/**
 * Production-Ready Server Configuration
 * 
 * This file shows how to enhance the server with additional security features
 * for production deployment. Copy the relevant sections to server/index.js
 * when deploying to production.
 */

const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');

// Additional security packages (install with: npm install express-rate-limit helmet express-mongo-sanitize)
// const rateLimit = require('express-rate-limit');
// const helmet = require('helmet');
// const mongoSanitize = require('express-mongo-sanitize');

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// PRODUCTION SECURITY MIDDLEWARE
// ========================================

// Uncomment these for production:

// 1. Security Headers
// app.use(helmet());

// 2. Request Size Limiting
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. MongoDB Query Sanitization
// app.use(mongoSanitize());

// 4. Rate Limiting - General
// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use('/api/', generalLimiter);

// 5. Rate Limiting - Strict (for POST routes)
// const strictLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10, // limit to 10 requests per 15 minutes
//   message: 'Too many requests from this IP, please try again later.'
// });

// ========================================
// CORS Configuration (Update for production domains)
// ========================================

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || 'https://yourdomain.com'
    : '*',
  credentials: true,
};
app.use(cors(corsOptions));

// ========================================
// Example: Protected Route with Rate Limiting
// ========================================

// For production, apply strictLimiter to POST routes:
// app.post('/api/bookings', strictLimiter, async (req, res) => {
//   // ... booking logic
// });

// app.post('/api/contact', strictLimiter, async (req, res) => {
//   // ... contact logic
// });

// app.post('/api/tailor-trip', strictLimiter, async (req, res) => {
//   // ... tailor trip logic
// });

// ========================================
// Error Handling Middleware
// ========================================

// Global error handler (add before app.listen)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'An error occurred. Please try again later.'
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    message: message
  });
});

// ========================================
// Production Environment Variables
// ========================================

/*
Add to .env for production:

NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/egypt-advisor-tours?retryWrites=true&w=majority
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
COMPANY_EMAIL=info@egyptadvisortours.com
*/

// ========================================
// Health Check with System Info
// ========================================

app.get('/api/health', (req, res) => {
  const healthcheck = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    // Don't expose in production:
    // mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  res.json(healthcheck);
});

module.exports = app;