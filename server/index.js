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
const BLOGS_FILE = path.join(__dirname, '../client/src/data/blogs-data.js');
const GALLERY_FILE = path.join(__dirname, '../client/src/data/gallery-data.js');
const BOOKINGS_FILE = path.join(__dirname, '../client/src/data/bookings-data.js');
const SLIDESHOW_FILE = path.join(__dirname, '../client/src/data/slideshow-data.js');
const SETTINGS_FILE = path.join(__dirname, '../client/src/data/site-settings.js');

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
            const tours = JSON.parse(toursMatch[1]);
            const testimonials = JSON.parse(testimonialsMatch[1]);
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
            const contactInfo = JSON.parse(match[1]);
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

// ============================================
// BLOGS API ENDPOINTS
// ============================================

// Get blogs data
app.get('/api/blogs', (req, res) => {
    try {
        const fileContent = fs.readFileSync(BLOGS_FILE, 'utf8');
        const blogsMatch = fileContent.match(/export const blogs = (\[[\s\S]*?\]);/);
        
        if (blogsMatch) {
            const blogs = JSON.parse(blogsMatch[1]);
            res.json({ blogs });
        } else {
            res.status(500).json({ error: 'Failed to parse blogs data' });
        }
    } catch (error) {
        console.error('Error reading blogs:', error);
        res.status(500).json({ error: 'Failed to read blogs data' });
    }
});

// Save blogs data
app.post('/api/blogs', (req, res) => {
    try {
        const { blogs } = req.body;
        
        const fileContent = `// ============================================
// BLOGS DATA FILE
// ============================================
// This file contains all blog posts for the website.

export const blogs = ${JSON.stringify(blogs, null, 2)};
`;
        
        fs.writeFileSync(BLOGS_FILE, fileContent, 'utf8');
        res.json({ success: true, message: 'Blogs saved successfully' });
    } catch (error) {
        console.error('Error saving blogs:', error);
        res.status(500).json({ error: 'Failed to save blogs data' });
    }
});

// ============================================
// GALLERY API ENDPOINTS
// ============================================

// Get gallery data
app.get('/api/gallery', (req, res) => {
    try {
        const fileContent = fs.readFileSync(GALLERY_FILE, 'utf8');
        const galleryMatch = fileContent.match(/export const gallery = (\[[\s\S]*?\]);/);
        
        if (galleryMatch) {
            const gallery = JSON.parse(galleryMatch[1]);
            res.json({ gallery });
        } else {
            res.status(500).json({ error: 'Failed to parse gallery data' });
        }
    } catch (error) {
        console.error('Error reading gallery:', error);
        res.status(500).json({ error: 'Failed to read gallery data' });
    }
});

// Save gallery data
app.post('/api/gallery', (req, res) => {
    try {
        const { gallery } = req.body;
        
        const fileContent = `// ============================================
// GALLERY DATA FILE
// ============================================
// This file contains all gallery images for the website.

export const gallery = ${JSON.stringify(gallery, null, 2)};
`;
        
        fs.writeFileSync(GALLERY_FILE, fileContent, 'utf8');
        res.json({ success: true, message: 'Gallery saved successfully' });
    } catch (error) {
        console.error('Error saving gallery:', error);
        res.status(500).json({ error: 'Failed to save gallery data' });
    }
});

// ============================================
// BOOKINGS API ENDPOINTS
// ============================================

// Get bookings data
app.get('/api/bookings', (req, res) => {
    try {
        const fileContent = fs.readFileSync(BOOKINGS_FILE, 'utf8');
        const bookingsMatch = fileContent.match(/export const bookings = (\[[\s\S]*?\]);/);
        
        if (bookingsMatch) {
            const bookings = JSON.parse(bookingsMatch[1]);
            res.json({ bookings });
        } else {
            res.status(500).json({ error: 'Failed to parse bookings data' });
        }
    } catch (error) {
        console.error('Error reading bookings:', error);
        res.status(500).json({ error: 'Failed to read bookings data' });
    }
});

// Save bookings data
app.post('/api/bookings', (req, res) => {
    try {
        const { bookings } = req.body;
        
        const fileContent = `// ============================================
// BOOKINGS DATA FILE
// ============================================
// This file contains all booking records for the admin panel.

export const bookings = ${JSON.stringify(bookings, null, 2)};
`;
        
        fs.writeFileSync(BOOKINGS_FILE, fileContent, 'utf8');
        res.json({ success: true, message: 'Bookings saved successfully' });
    } catch (error) {
        console.error('Error saving bookings:', error);
        res.status(500).json({ error: 'Failed to save bookings data' });
    }
});

// ============================================
// SLIDESHOW API ENDPOINTS
// ============================================

// Get slideshow data
app.get('/api/slideshow', (req, res) => {
    try {
        const fileContent = fs.readFileSync(SLIDESHOW_FILE, 'utf8');
        const slidesMatch = fileContent.match(/export const slides = (\[[\s\S]*?\]);?/);

        if (slidesMatch) {
            const slides = JSON.parse(slidesMatch[1]);
            res.json({ slides });
        } else {
            res.status(500).json({ error: 'Failed to parse slideshow data' });
        }
    } catch (error) {
        console.error('Error reading slideshow:', error);
        res.status(500).json({ error: 'Failed to read slideshow data' });
    }
});

// Save slideshow data
app.post('/api/slideshow', (req, res) => {
    try {
        const { slides } = req.body;

        const fileContent = `// ============================================
// SLIDESHOW DATA FILE
// ============================================
// This file controls the home page hero slideshow images.
// Each slide has a name, an image URL, and a gradient fallback color.
// You can manage these slides from the Admin Panel → Slideshow tab.

export const slides = ${JSON.stringify(slides, null, 2)};
`;

        fs.writeFileSync(SLIDESHOW_FILE, fileContent, 'utf8');
        res.json({ success: true, message: 'Slideshow saved successfully' });
    } catch (error) {
        console.error('Error saving slideshow:', error);
        res.status(500).json({ error: 'Failed to save slideshow data' });
    }
});

// ============================================
// SITE SETTINGS API ENDPOINTS
// ============================================

// Get site settings
app.get('/api/settings', (req, res) => {
    try {
        const fileContent = fs.readFileSync(SETTINGS_FILE, 'utf8');
        const match = fileContent.match(/export const siteSettings = ({[\s\S]*?});[\s\n]*$/);

        if (match) {
            try {
                const settings = JSON.parse(match[1]);
                res.json(settings);
            } catch (parseError) {
                console.error('Error parsing site settings JSON:', parseError.message);
                res.status(500).json({ error: `Failed to parse site settings: ${parseError.message}` });
            }
        } else {
            res.status(500).json({ error: 'Failed to parse site settings' });
        }
    } catch (error) {
        console.error('Error reading site settings:', error);
        res.status(500).json({ error: 'Failed to read site settings' });
    }
});

// Save site settings
app.post('/api/settings', (req, res) => {
    try {
        const settings = req.body;

        const fileContent = `// ============================================
// SITE SETTINGS FILE
// ============================================
// This file controls the main content shown on your homepage.
// Edit these values from the Admin Panel → Site Settings tab.

export const siteSettings = ${JSON.stringify(settings, null, 2)};
`;

        fs.writeFileSync(SETTINGS_FILE, fileContent, 'utf8');
        res.json({ success: true, message: 'Site settings saved successfully' });
    } catch (error) {
        console.error('Error saving site settings:', error);
        res.status(500).json({ error: 'Failed to save site settings' });
    }
});

// Serve the React static build when it exists (i.e. after running npm run build).
// This catch-all is intentionally placed after all API routes so it only
// matches non-API paths.
const buildPath = path.join(__dirname, '../client/build');
if (process.env.NODE_ENV !== 'development' && fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;