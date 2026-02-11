const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/egypt-advisor-tours';

mongoose.connect(MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Tour Schema
const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 5 },
  highlights: [String],
  included: [String],
  itinerary: [{ day: Number, description: String }],
  featured: { type: Boolean, default: false }
});

const Tour = mongoose.model('Tour', tourSchema);

// Routes

// Get all tours
app.get('/api/tours', async (req, res) => {
  try {
    const tours = await Tour.find();
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tours', error: error.message });
  }
});

// Get featured tours
app.get('/api/tours/featured', async (req, res) => {
  try {
    const tours = await Tour.find({ featured: true }).limit(6);
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured tours', error: error.message });
  }
});

// Get single tour by ID
app.get('/api/tours/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tour', error: error.message });
  }
});

// Create a booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, phone, tourId, date, participants } = req.body;
    
    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Tour Booking Confirmation - Egypt Advisor Tours',
      html: `
        <h2>Thank you for your booking!</h2>
        <p>Dear ${name},</p>
        <p>We have received your booking request for the tour on ${date}.</p>
        <p><strong>Booking Details:</strong></p>
        <ul>
          <li>Number of participants: ${participants}</li>
          <li>Phone: ${phone}</li>
        </ul>
        <p>Our team will contact you shortly to confirm your booking.</p>
        <p>Best regards,<br>Egypt Advisor Tours Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Booking request received successfully. Check your email for confirmation.' 
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing booking. Please try again later.' 
    });
  }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Send to company
    const companyMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.COMPANY_EMAIL || process.env.EMAIL_USER,
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Send confirmation to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'We received your message - Egypt Advisor Tours',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Best regards,<br>Egypt Advisor Tours Team</p>
      `
    };

    await transporter.sendMail(companyMailOptions);
    await transporter.sendMail(userMailOptions);
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully. We will contact you soon!' 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending message. Please try again later.' 
    });
  }
});

// Custom trip request
app.post('/api/tailor-trip', async (req, res) => {
  try {
    const { name, email, phone, destination, startDate, endDate, participants, budget, interests, message } = req.body;
    
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const companyMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.COMPANY_EMAIL || process.env.EMAIL_USER,
      subject: 'New Custom Trip Request',
      html: `
        <h3>New Custom Trip Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Destination:</strong> ${destination}</p>
        <p><strong>Dates:</strong> ${startDate} to ${endDate}</p>
        <p><strong>Participants:</strong> ${participants}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Interests:</strong> ${interests}</p>
        <p><strong>Additional Details:</strong></p>
        <p>${message}</p>
      `
    };

    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Custom Trip Request Received - Egypt Advisor Tours',
      html: `
        <h2>Thank you for your custom trip request!</h2>
        <p>Dear ${name},</p>
        <p>We have received your request to create a tailored trip to ${destination}.</p>
        <p>Our travel experts will review your preferences and contact you within 24-48 hours with a personalized itinerary.</p>
        <p>Best regards,<br>Egypt Advisor Tours Team</p>
      `
    };

    await transporter.sendMail(companyMailOptions);
    await transporter.sendMail(userMailOptions);
    
    res.json({ 
      success: true, 
      message: 'Trip request submitted successfully. We will contact you soon with a custom itinerary!' 
    });
  } catch (error) {
    console.error('Tailor trip error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting trip request. Please try again later.' 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
