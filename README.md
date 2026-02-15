# Egypt Advisor Tours

## Project Overview
Egypt Advisor Tours is a travel agency website designed to help travelers plan their visits to Egypt with ease. It provides useful information about various tours, attractions, accommodations, and travel tips to create unforgettable experiences.

## ⚠️ IMPORTANT: Monorepo Structure

This is a **monorepo** with separate `client/` and `server/` directories. 

**⚠️ ALL commands below must be run from the ROOT directory of the project, NOT from inside `client/` or `server/` folders!**

```
egypt-advisor-tours/          ← Run commands from HERE (root)
├── client/                   ← React frontend
├── server/                   ← Node.js backend
└── package.json             ← Contains all convenience scripts
```

## Installation Instructions

This is a monorepo project with a React frontend (client) and Node.js backend (server).

### Quick Start (Install All Dependencies)
```bash
# Clone the repository
git clone https://github.com/jozoxm/egypt-advisor-tours.git
cd egypt-advisor-tours

# Install all dependencies (client + server)
npm run install:all
```

### Starting the Application

#### Start the Client (React Frontend)
```bash
npm run start:client
```
The client will run on http://localhost:3000

#### Start the Server (Node.js Backend)
```bash
npm run start:server
# or for development with auto-reload
npm run dev:server
```

### Individual Installation
If you prefer to install dependencies separately:

```bash
# Install client dependencies
npm run install:client

# Install server dependencies
npm run install:server
```

### Available Scripts
- `npm run install:all` - Install all dependencies
- `npm run start:client` - Start React development server
- `npm run start:server` - Start Node.js server
- `npm run build` - Build React app for production (same as build:client)
- `npm run test:client` - Run client tests
- `npm run clean` - Remove all node_modules and lock files

## Features
- Comprehensive tour listings with detailed descriptions
- User-friendly interface with easy navigation
- Booking system for tours and accommodations
- Customer reviews and ratings for each tour
- Blog section for travel tips and advice
- Multi-language support

---

## Troubleshooting

### ❌ Error: "Missing script: 'install:all'"

**Problem:** You're running the command from inside the `client/` or `server/` directory.

**Solution:** Navigate to the **root directory** of the project:

```bash
# If you're in client/ directory
cd ..

# If you're in server/ directory
cd ..

# Now you're in the root - verify with:
pwd  # Should show: /path/to/egypt-advisor-tours (not /client or /server)

# Now run the command:
npm run install:all
```

### ❌ Error: "'react-scripts' is not recognized"

**Problem:** Dependencies haven't been installed yet.

**Solution:** 
```bash
# From root directory
npm run install:all
```

### ❌ Error: "Cannot find module 'express'" or "Cannot find module '[...]/server/index.js'"

**Problem:** Server dependencies haven't been installed yet.

**Solution:** 
```bash
# From root directory - install all dependencies
npm run install:all

# Or install only server dependencies
npm run install:server
```

**Note:** The server now includes a pre-start check that will display a helpful error message if dependencies are missing.

### ❌ Build or start errors

**Problem:** Dependencies might be outdated or corrupted.

**Solution:**
```bash
# From root directory - clean and reinstall everything
npm run clean
npm run install:all
```

---

## Need Help?

- Check STATUS.md for current repository health
- Check SECURITY.md for security information
- Report issues on GitHub: https://github.com/jozoxm/egypt-advisor-tours/issues
