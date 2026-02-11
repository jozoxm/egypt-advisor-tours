#!/bin/bash

# Simple Website Preview Script for Egypt Advisor Tours
# This script helps you quickly start both frontend and backend servers

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║           🏛️  Egypt Advisor Tours - Website Preview  🏛️                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo -e "${RED}❌ Error: This script must be run from the egypt-advisor-tours root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Prerequisites Check...${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Setting up environment...${NC}"
echo ""

# Setup backend
echo -e "${YELLOW}📦 Setting up backend (server)...${NC}"
cd server

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed ✓"
fi

if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/egypt-advisor-tours

# Email settings (optional for preview)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password
# COMPANY_EMAIL=info@egyptadvisortours.com
EOL
    echo -e "${GREEN}✅ Backend .env created${NC}"
else
    echo "Backend .env already exists ✓"
fi

cd ..

# Setup frontend
echo ""
echo -e "${YELLOW}📦 Setting up frontend (client)...${NC}"
cd client

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed ✓"
fi

if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
    echo -e "${GREEN}✅ Frontend .env created${NC}"
else
    echo "Frontend .env already exists ✓"
fi

cd ..

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                         🚀 Starting Servers...                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check MongoDB
echo -e "${BLUE}🔍 Checking MongoDB...${NC}"
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB is installed but not running${NC}"
        echo "Starting MongoDB..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew services start mongodb-community 2>/dev/null || echo "Please start MongoDB manually: brew services start mongodb-community"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo systemctl start mongod 2>/dev/null || echo "Please start MongoDB manually: sudo systemctl start mongod"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  MongoDB not detected${NC}"
    echo "You can:"
    echo "  1. Install MongoDB locally"
    echo "  2. Use MongoDB Atlas (update server/.env with connection string)"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}🌱 Note: Run 'cd server && npm run seed' to add sample tours${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${BLUE}🔧 Starting backend server...${NC}"
cd server
npm start &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}🎨 Starting frontend...${NC}"
cd client
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                           ✅ SERVERS RUNNING ✅                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}Backend:${NC}  http://localhost:5000"
echo ""
echo -e "${YELLOW}📝 Tips:${NC}"
echo "  • Frontend should open automatically in your browser"
echo "  • Press Ctrl+C to stop both servers"
echo "  • Check HOW_TO_PREVIEW.md for detailed instructions"
echo ""
echo "Waiting for servers to initialize..."
echo ""

# Keep script running
wait
