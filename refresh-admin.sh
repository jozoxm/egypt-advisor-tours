#!/bin/bash

# Refresh Admin Button Script
# This script automates the complete refresh process

echo "🔄 Egypt Advisor Tours - Admin Button Refresh"
echo "=============================================="
echo ""

# Step 1: Pull latest changes
echo "📥 Step 1: Pulling latest changes..."
git pull origin main 2>/dev/null || git pull origin copilot/remove-video-from-hero
echo "✅ Latest changes pulled"
echo ""

# Step 2: Clean node_modules
echo "🧹 Step 2: Cleaning old dependencies..."
rm -rf node_modules client/node_modules server/node_modules 2>/dev/null
rm -rf client/build client/.cache 2>/dev/null
echo "✅ Cleaned successfully"
echo ""

# Step 3: Reinstall dependencies
echo "📦 Step 3: Installing fresh dependencies..."
npm run install:all
echo "✅ Dependencies installed"
echo ""

# Step 4: Kill old processes
echo "🛑 Step 4: Stopping old servers..."
lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null
lsof -ti :5000 2>/dev/null | xargs kill -9 2>/dev/null
echo "✅ Old servers stopped"
echo ""

echo "🎉 Refresh complete!"
echo ""
echo "Next steps:"
echo "1. Terminal 1: npm run start:server"
echo "2. Terminal 2: npm run start:client"
echo "3. Hard refresh browser: Ctrl+Shift+R (3 times)"
echo "4. Open: http://localhost:3000"
echo ""
echo "Look for version 1.0.1 in browser console (F12)"
echo "Admin button should be visible between 'Contact' and 'Inquiry'"
