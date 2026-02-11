# Egypt Advisor Tours - Development Guide

## Quick Start

### Backend Server

1. Install dependencies:
```bash
cd server
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and email credentials
```

3. Seed the database:
```bash
npm run seed
```

4. Start the server:
```bash
npm run dev  # Development with auto-reload
# or
npm start    # Production
```

### Frontend Client

1. Install dependencies:
```bash
cd client
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env to set API_URL if different from default
```

3. Start the development server:
```bash
npm start
```

## Project Structure Overview

### Backend (server/)
- `index.js` - Main Express server with API routes
- `seed.js` - Database seeding script with sample tours
- `.env` - Environment configuration (not in git)

### Frontend (client/)
- `src/App.jsx` - Main application component with routing
- `src/components/` - Reusable UI components
  - `Navbar.jsx` - Navigation bar with mobile support
  - `Footer.jsx` - Site footer with company info
  - `Hero.jsx` - Hero section for homepage
  - `TourCard.jsx` - Tour listing card
  - `BookingForm.jsx` - Tour booking form
- `src/pages/` - Page components
  - `Home.jsx` - Homepage with featured tours
  - `Tours.jsx` - Tours listing with filters
  - `TourDetail.jsx` - Individual tour details
  - `Contact.jsx` - Contact form
  - `About.jsx` - About page
  - `EgyptianPhrases.jsx` - Language guide
  - `EgyptianFood.jsx` - Food guide
  - `TailorTrip.jsx` - Custom trip request form

## API Documentation

### Tours
- `GET /api/tours` - Get all tours
- `GET /api/tours/featured` - Get featured tours only
- `GET /api/tours/:id` - Get specific tour by ID

### Bookings
- `POST /api/bookings` - Create a booking
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "tourId": "tour_id_here",
    "date": "2026-12-25",
    "participants": 2
  }
  ```

### Contact
- `POST /api/contact` - Send contact form message
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Question about tours",
    "message": "Your message here"
  }
  ```

### Custom Trips
- `POST /api/tailor-trip` - Submit custom trip request
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "destination": "Egypt",
    "startDate": "2026-12-25",
    "endDate": "2027-01-05",
    "participants": "2",
    "budget": "mid-range",
    "interests": "Ancient History, Photography",
    "message": "Additional requirements..."
  }
  ```

## Database Schema

### Tour Model
```javascript
{
  title: String,          // Tour name
  description: String,    // Detailed description
  price: Number,          // Price per person in USD
  duration: String,       // e.g., "Full Day", "3 Days"
  image: String,          // Image URL
  category: String,       // e.g., "Historical", "Cruise", "Adventure"
  rating: Number,         // 0-5 stars
  highlights: [String],   // Key highlights
  included: [String],     // What's included in the tour
  itinerary: [{
    day: Number,
    description: String
  }],
  featured: Boolean       // Featured on homepage
}
```

## Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/egypt-advisor-tours
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
COMPANY_EMAIL=info@egyptadvisortours.com
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Common Issues & Solutions

### MongoDB Connection Error
- Ensure MongoDB is running: `sudo systemctl start mongod`
- Check MONGODB_URI in .env file
- For MongoDB Atlas, ensure IP is whitelisted

### Email Not Sending
- For Gmail: Enable 2-Step Verification and create App Password
- Update EMAIL_USER and EMAIL_PASSWORD in .env
- Restart the server after changing .env

### CORS Errors
- Backend server includes CORS middleware
- Ensure API_URL in client .env matches backend URL

### Port Already in Use
- Change PORT in server/.env
- Update REACT_APP_API_URL in client/.env accordingly

## Testing the Application

### Manual Testing Checklist
1. ✓ Homepage loads with featured tours
2. ✓ Tours page shows all tours with working filters
3. ✓ Tour detail page displays complete information
4. ✓ Booking form submits successfully
5. ✓ Contact form sends emails
6. ✓ Custom trip form works
7. ✓ Navigation works across all pages
8. ✓ Mobile responsive design works

## Deployment Considerations

### Backend
- Set NODE_ENV=production
- Use process manager (PM2, Forever)
- Set up reverse proxy (Nginx)
- Configure proper MongoDB connection
- Use environment-specific email credentials

### Frontend
- Build for production: `npm run build`
- Serve build folder with static server
- Update REACT_APP_API_URL to production API
- Enable HTTPS

## Security Notes

1. Never commit .env files
2. Use strong MongoDB passwords
3. Validate all user inputs
4. Sanitize database queries
5. Use HTTPS in production
6. Keep dependencies updated
7. Rate limit API endpoints (recommended)

## Future Enhancements

- User authentication system
- Payment integration
- Review and rating system
- Multi-language support
- Real-time availability checking
- Admin dashboard
- Image gallery for tours
- Blog section
- Newsletter functionality
- Social media integration
