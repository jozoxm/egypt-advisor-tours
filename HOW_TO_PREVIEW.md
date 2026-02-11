# 🌐 How to Preview the Egypt Advisor Tours Website

This guide will help you preview the website on your local computer in just a few minutes!

## 📋 Quick Overview

The Egypt Advisor Tours website has two parts:
1. **Backend** (server) - Handles data and API requests
2. **Frontend** (client) - The website you see in your browser

You'll need to run both to preview the full website.

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites Check

Before starting, make sure you have:
- ✅ **Node.js** installed (version 14 or higher)
  - Check: Open terminal and run `node --version`
  - [Download Node.js](https://nodejs.org/) if you don't have it
- ✅ **MongoDB** installed OR a MongoDB Atlas account (free)
  - For local: [Download MongoDB](https://www.mongodb.com/try/download/community)
  - For cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (no download needed)

---

## 🚀 Step-by-Step Preview Guide

### Option 1: Quick Preview (Without Database Features)

If you just want to see the website interface without booking/contact features:

#### Terminal 1 - Backend (Minimal):
```bash
cd server
npm install
echo "PORT=5000" > .env
npm start
```

#### Terminal 2 - Frontend:
```bash
cd client
npm install
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm start
```

**That's it!** Your browser should automatically open to `http://localhost:3000`

---

### Option 2: Full Preview (With All Features)

For the complete experience with tours, bookings, and all features:

#### Step 1: Set Up MongoDB

**Choose ONE option:**

**Option A - Local MongoDB (Recommended for Testing):**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows (after installing from mongodb.com)
# MongoDB will run as a service automatically

# Linux
sudo systemctl start mongod
```

**Option B - MongoDB Atlas (Cloud - No Installation):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

#### Step 2: Configure Backend

Open Terminal/Command Prompt:

```bash
cd server
npm install
```

Create `.env` file (or copy from `.env.example`):
```bash
cp .env.example .env
```

Edit the `.env` file with these settings:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/egypt-advisor-tours
# Or use your Atlas connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/egypt-advisor-tours

# Email settings (optional for preview)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password
```

#### Step 3: Add Sample Tours

```bash
npm run seed
```

Expected output: ✅ "Database seeded successfully with sample tours!"

#### Step 4: Start Backend Server

```bash
npm start
```

Expected output:
```
✅ Server is running on port 5000
✅ MongoDB connected successfully
```

**Keep this terminal open!**

#### Step 5: Configure Frontend

Open a **NEW** Terminal/Command Prompt:

```bash
cd client
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

The `.env` file should contain:
```
REACT_APP_API_URL=http://localhost:5000/api
```

#### Step 6: Start Frontend

```bash
npm start
```

**Your browser will automatically open to** `http://localhost:3000` 🎉

---

## 🎯 What You Should See

Once the website loads, you should see:

1. **Homepage** with:
   - Hero section with "Discover the Wonders of Egypt"
   - Featured tours (8 sample Egyptian tours)
   - "Why Choose Us" section
   - Guides section

2. **Navigation Menu** with:
   - Home
   - Tours
   - Phrases
   - Food
   - Tailor Trip
   - About
   - Contact

3. **Interactive Features**:
   - Click "Explore Tours" to see all tours
   - Filter tours by category
   - Sort by price or rating
   - Click any tour to see details
   - Try the booking form
   - Browse Egyptian phrases and food guides

---

## 🛑 Troubleshooting

### Problem: "Port 3000 is already in use"

**Solution:**
```bash
# Find what's using the port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use a different port
# In client directory, create .env with:
PORT=3001
```

### Problem: "MongoDB connection failed"

**Solutions:**
1. **Check MongoDB is running:**
   ```bash
   # Mac
   brew services list
   
   # Linux
   sudo systemctl status mongod
   
   # Windows - Check Services app for "MongoDB"
   ```

2. **Start MongoDB if stopped:**
   ```bash
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Use MongoDB Atlas instead** (cloud - no local setup needed)

### Problem: "npm install fails"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Problem: "Module not found" errors

**Solution:**
```bash
# Make sure you're in the right directory
pwd  # Should show either .../client or .../server

# Install dependencies
npm install
```

### Problem: Backend runs but frontend shows errors

**Solution:**
Check that `client/.env` has the correct API URL:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Problem: Tours don't show up

**Solution:**
1. Check backend is running (Terminal 1 should show "Server is running")
2. Run the seed command again:
   ```bash
   cd server
   npm run seed
   ```

---

## 🎨 What to Test

Once the website is running, try these features:

### Homepage
- [ ] Hero section loads with pyramid image
- [ ] Featured tours display (should show 8 tours)
- [ ] "Why Choose Us" cards appear
- [ ] Explore Guides section links work

### Tours Page
- [ ] All tours display
- [ ] Filter by category (Historical, Cruise, Adventure, etc.)
- [ ] Sort by price (Low to High, High to Low)
- [ ] Sort by rating
- [ ] Search functionality works

### Tour Details
- [ ] Click any tour to see details
- [ ] Tour information displays correctly
- [ ] Highlights and included items show
- [ ] Booking form is visible
- [ ] Price displays correctly

### Other Pages
- [ ] Egyptian Phrases - search works
- [ ] Egyptian Food - information displays
- [ ] About page loads
- [ ] Contact form displays
- [ ] Tailor Trip form displays

### Responsive Design
- [ ] Resize browser to test mobile view
- [ ] Menu hamburger appears on mobile
- [ ] All pages work on different screen sizes

---

## 🔄 Stopping the Preview

To stop the servers:

1. **Stop Frontend**: Press `Ctrl+C` in the terminal running the client
2. **Stop Backend**: Press `Ctrl+C` in the terminal running the server

---

## 💡 Tips for Best Preview Experience

1. **Use Chrome or Firefox** for best compatibility
2. **Open Developer Tools** (F12) to see any errors in console
3. **Test all pages** to see the full functionality
4. **Try different screen sizes** to see responsive design
5. **Check Network tab** in dev tools to see API calls

---

## 📱 Preview on Mobile Devices

To preview on your phone/tablet on the same network:

1. Find your computer's local IP address:
   ```bash
   # Mac/Linux
   ifconfig | grep inet
   
   # Windows
   ipconfig
   ```
   Look for something like `192.168.1.x`

2. Make sure your phone is on the same WiFi network

3. On your phone's browser, visit:
   ```
   http://YOUR_IP_ADDRESS:3000
   ```
   Example: `http://192.168.1.5:3000`

---

## 🆘 Still Need Help?

If you're still having trouble:

1. **Check Documentation:**
   - `README.md` - Full installation guide
   - `NEXT_STEPS.md` - Detailed setup instructions
   - `DEVELOPMENT.md` - Developer documentation

2. **Common Issues:**
   - Make sure you're in the correct directory
   - Verify Node.js and npm are installed: `node --version` and `npm --version`
   - Check both terminals are running (backend and frontend)
   - Ensure ports 3000 and 5000 are available

3. **Reset Everything:**
   ```bash
   # Stop all servers (Ctrl+C in both terminals)
   
   # Clean install backend
   cd server
   rm -rf node_modules package-lock.json
   npm install
   
   # Clean install frontend
   cd ../client
   rm -rf node_modules package-lock.json
   npm install
   
   # Start fresh from Step 4 above
   ```

---

## 🎉 Enjoy Exploring!

You're now running the Egypt Advisor Tours website locally! 

**Default URLs:**
- Frontend (Website): http://localhost:3000
- Backend (API): http://localhost:5000

Explore the tours, test the features, and enjoy your preview of ancient Egypt! 🏛️✨
