# Egypt Advisor Tours

## ⚠️ IMPORTANT: Run Commands from Root Directory!

**Common Issue:** Getting "Missing script" errors?

➡️ **[Read the Quick Start Guide](QUICK-START-GUIDE.md)** for detailed instructions!

You're probably in the wrong directory. All npm commands must be run from the repository root:
```bash
cd "D:\save\New folder\egypt-advisor-tours"  # Windows
cd /path/to/egypt-advisor-tours              # Mac/Linux
```

---

## Project Overview
Egypt Advisor Tours is a travel agency website designed to help travelers plan their visits to Egypt with ease. It provides useful information about various tours, attractions, accommodations, and travel tips to create unforgettable experiences.

## Installation Instructions

### ✅ Quick Start (Recommended)
1. Clone the repository:  
   ```bash
   git clone https://github.com/jozoxm/egypt-advisor-tours.git
   ```
2. Navigate to the project directory:  
   ```bash
   cd egypt-advisor-tours
   ```
3. Verify you're in the right place:
   ```bash
   ls package.json  # Mac/Linux
   dir package.json  # Windows
   ```
4. Install all dependencies (client and server):  
   ```bash
   npm run install:all
   ```
5. Start the client development server:  
   ```bash
   npm run start:client
   ```
   Opens at: http://localhost:3000

### Alternative: Install Client Only
If you only want to run the frontend:
```bash
cd egypt-advisor-tours  # Make sure you're in root!
npm run install:client
npm run start:client
```

### Troubleshooting "Missing script" Errors

**Problem:** You're in the wrong directory!

Check where you are:
- ❌ `client/public/` - Wrong! Go up two levels: `cd ../..`
- ❌ `client/` - Wrong! Go up one level: `cd ..`
- ✅ `egypt-advisor-tours/` - Correct!

**Solution:** Always navigate to repository root before running npm commands.

### Alternative: Manual Installation
If you prefer to install dependencies manually:
1. Install client dependencies:  
   ```bash
   cd client
   npm install
   ```
2. Install server dependencies:  
   ```bash
   cd ../server
   npm install
   ```
3. Start the client:  
   ```bash
   cd ../client
   npm start
   ```

## Available npm Scripts (Run from Root!)

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all dependencies (client + server) |
| `npm run install:client` | Install client dependencies only |
| `npm run install:server` | Install server dependencies only |
| `npm run start:client` | Start React development server (http://localhost:3000) |
| `npm run start:server` | Start Node.js backend server (http://localhost:5000) |
| `npm run build` | Build client for production |
| `npm run test` | Run client tests |

## Features
- Comprehensive tour listings with detailed descriptions
- User-friendly interface with easy navigation
- Booking system for tours and accommodations
- Customer reviews and ratings for each tour
- Blog section for travel tips and advice
- Multi-language support
