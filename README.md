# Egypt Advisor Tours

## Project Overview
Egypt Advisor Tours is a full-stack travel agency website designed to help travelers plan their visits to Egypt with ease. It provides comprehensive information about various tours, attractions, accommodations, and travel tips to create unforgettable experiences.

## 🚀 Quick Start - Preview the Website

Want to see the website running locally? **It's easy!**

### Fastest Way (Automated):
```bash
# Mac/Linux
./preview.sh

# Windows
preview.bat
```

### Manual Way (5 Minutes):
See **[HOW_TO_PREVIEW.md](HOW_TO_PREVIEW.md)** for detailed step-by-step instructions.

### What You Need:
- Node.js (v14+)
- MongoDB (local or Atlas account)
- 5 minutes of your time

**Preview URLs:**
- Frontend (Website): http://localhost:3000
- Backend (API): http://localhost:5000

---

## Tech Stack
- **Frontend**: React 17, React Router, Axios, Bootstrap, Styled Components
- **Backend**: Node.js, Express, MongoDB, Nodemailer
- **Database**: MongoDB

## Features
- Comprehensive tour listings with detailed descriptions
- User-friendly interface with easy navigation
- Booking system for tours and accommodations
- Featured tours showcase on homepage
- Tour filtering and sorting capabilities
- Contact form with email integration
- Custom trip planning/tailoring
- Egyptian phrases guide
- Egyptian food guide
- Responsive design for all devices

## Installation Instructions

### Prerequisites
- Node.js (v14.0.0 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/egypt-advisor-tours
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   COMPANY_EMAIL=info@egyptadvisortours.com
   ```

5. Make sure MongoDB is running locally, or update `MONGODB_URI` with your MongoDB Atlas connection string.

6. Seed the database with sample tours:
   ```bash
   npm run seed
   ```

7. Start the backend server:
   ```bash
   npm start
   ```
   or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure the API URL in `.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. Start the development server:
   ```bash
   npm start
   ```

   The application will open in your browser at http://localhost:3000

## Project Structure

```
egypt-advisor-tours/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── BookingForm.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── TourCard.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Tours.jsx
│   │   │   ├── TourDetail.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── About.jsx
│   │   │   ├── EgyptianPhrases.jsx
│   │   │   ├── EgyptianFood.jsx
│   │   │   └── TailorTrip.jsx
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
│
├── server/                # Node.js backend
│   ├── index.js          # Express server setup
│   ├── seed.js           # Database seeding script
│   ├── .env.example      # Environment variables template
│   └── package.json
│
└── README.md

```

## API Endpoints

### Tours
- `GET /api/tours` - Get all tours
- `GET /api/tours/featured` - Get featured tours
- `GET /api/tours/:id` - Get single tour by ID

### Bookings
- `POST /api/bookings` - Create a new booking

### Contact
- `POST /api/contact` - Send contact form message

### Custom Trips
- `POST /api/tailor-trip` - Submit custom trip request

## Available Scripts

### Backend (server/)
- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run seed` - Seed the database with sample tours

### Frontend (client/)
- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Email Configuration

To enable email functionality (contact forms, booking confirmations):

1. Use Gmail or another email service
2. For Gmail, enable "2-Step Verification" and create an "App Password"
3. Update the `.env` file in the server directory with your credentials
4. Restart the server

## MongoDB Setup Options

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use default connection string: `mongodb://localhost:27017/egypt-advisor-tours`

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` with your Atlas connection string

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
ISC

## Author
jozoxm

## Support
For support, email info@egyptadvisortours.com
