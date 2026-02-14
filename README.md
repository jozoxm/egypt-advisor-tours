# Egypt Advisor Tours

## Project Overview
Egypt Advisor Tours is a travel agency website designed to help travelers plan their visits to Egypt with ease. It provides useful information about various tours, attractions, accommodations, and travel tips to create unforgettable experiences.

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
- `npm run build:client` - Build React app for production
- `npm run test:client` - Run client tests
- `npm run clean` - Remove all node_modules and lock files

## Features
- Comprehensive tour listings with detailed descriptions
- User-friendly interface with easy navigation
- Booking system for tours and accommodations
- Customer reviews and ratings for each tour
- Blog section for travel tips and advice
- Multi-language support
