const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Paths to data files
const TOURS_FILE = path.join(__dirname, '../client/src/data/tours-data.js');
const CONTACT_FILE = path.join(__dirname, '../client/src/data/contact-info.js');

app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to Egypt Advisor Tours API',
        version: '1.0.0',
        status: 'Server is running'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Get tours data
app.get('/api/tours', (req, res) => {
    try {
        const fileContent = fs.readFileSync(TOURS_FILE, 'utf8');
        // Extract tours array from the file
        const toursMatch = fileContent.match(/export const tours = (\[[\s\S]*?\]);/);
        const testimonialsMatch = fileContent.match(/export const testimonials = (\[[\s\S]*?\]);/);
        
        if (toursMatch && testimonialsMatch) {
            const tours = eval(toursMatch[1]);
            const testimonials = eval(testimonialsMatch[1]);
            res.json({ tours, testimonials });
        } else {
            res.status(500).json({ error: 'Failed to parse tours data' });
        }
    } catch (error) {
        console.error('Error reading tours:', error);
        res.status(500).json({ error: 'Failed to read tours data' });
    }
});

// Save tours data
app.post('/api/tours', (req, res) => {
    try {
        const { tours, testimonials } = req.body;
        
        // Generate the file content
        const fileContent = `// ============================================
// TOURS DATA FILE
// ============================================
// This file contains all tour information for the website.
// 
// HOW TO EDIT TOURS:
// 1. To change existing tour details, simply edit the values below
// 2. To add a new tour, copy an existing tour object and paste it at the end
// 3. Make sure to give it a unique 'id' number
// 4. Change the details (name, price, duration, description, etc.)
// 
// TOUR OBJECT STRUCTURE:
// - id: Unique number for the tour (1, 2, 3, etc.)
// - name: Tour name/title
// - price: Price with $ symbol (e.g., '$199')
// - duration: How long the tour takes (e.g., '4 hours')
// - description: Detailed description of the tour
// - image: Emoji icon (copy from emojipedia.org)
// - rating: Star rating out of 5 (e.g., 4.9)
// - reviews: Number of reviews
// - groupSize: Size of tour group (e.g., '2-10 people')

export const tours = ${JSON.stringify(tours, null, 2)};

// ============================================
// TESTIMONIALS DATA
// ============================================
// Customer testimonials that appear on the website

export const testimonials = ${JSON.stringify(testimonials || [], null, 2)};
`;
        
        fs.writeFileSync(TOURS_FILE, fileContent, 'utf8');
        res.json({ success: true, message: 'Tours saved successfully' });
    } catch (error) {
        console.error('Error saving tours:', error);
        res.status(500).json({ error: 'Failed to save tours data' });
    }
});

// Get contact info
app.get('/api/contact', (req, res) => {
    try {
        const fileContent = fs.readFileSync(CONTACT_FILE, 'utf8');
        // Extract contactInfo object from the file
        const match = fileContent.match(/export const contactInfo = ({[\s\S]*?});[\s\n]*$/);
        
        if (match) {
            const contactInfo = eval('(' + match[1] + ')');
            res.json(contactInfo);
        } else {
            res.status(500).json({ error: 'Failed to parse contact info' });
        }
    } catch (error) {
        console.error('Error reading contact info:', error);
        res.status(500).json({ error: 'Failed to read contact info' });
    }
});

// Save contact info
app.post('/api/contact', (req, res) => {
    try {
        const contactInfo = req.body;
        
        // Generate the file content
        const fileContent = `// ============================================
// CONTACT INFORMATION FILE
// ============================================
// This file contains all contact information for the website.
// 
// HOW TO EDIT CONTACT INFO:
// 1. Simply change the values below
// 2. The changes will automatically appear throughout the website
// 3. Make sure to keep the format the same (e.g., quotes around text)

export const contactInfo = ${JSON.stringify(contactInfo, null, 2)};
`;
        
        fs.writeFileSync(CONTACT_FILE, fileContent, 'utf8');
        res.json({ success: true, message: 'Contact info saved successfully' });
    } catch (error) {
        console.error('Error saving contact info:', error);
        res.status(500).json({ error: 'Failed to save contact info' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;