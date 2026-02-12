#!/bin/bash

# Egypt Advisor Tours - Automated Setup Script
# This script will install dependencies and start the development server

echo "=========================================="
echo "Egypt Advisor Tours - Setup & Start"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo "✅ npm detected: $(npm --version)"
echo ""

# Navigate to client directory
cd client || { echo "❌ Error: client directory not found!"; exit 1; }

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "📦 Dependencies already installed"
    echo ""
else
    echo "📦 Installing dependencies..."
    echo "⏱️  This may take 2-3 minutes..."
    echo ""
    npm install
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Dependencies installed successfully!"
        echo ""
    else
        echo ""
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
fi

# Start the development server
echo "🚀 Starting development server..."
echo "Your browser will open to http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="
echo ""

npm start
