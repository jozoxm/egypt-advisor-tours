#!/bin/bash

# Quick Fix Script for Git Merge Conflict with package-lock.json
# This script resolves the common issue when pulling updates

echo "========================================="
echo "Git Merge Conflict Quick Fix"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "server" ]; then
    echo "❌ Error: This script must be run from the egypt-advisor-tours root directory"
    exit 1
fi

# Check if package-lock.json exists and is untracked
if [ -f "server/package-lock.json" ]; then
    echo "📁 Found server/package-lock.json"
    
    # Check if it's tracked by git
    if git ls-files --error-unmatch server/package-lock.json 2>/dev/null; then
        echo "✅ File is already tracked by git"
    else
        echo "⚠️  File is untracked - this is causing the merge conflict"
        echo ""
        read -p "Do you want to remove it and pull updates? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🗑️  Removing untracked package-lock.json..."
            rm server/package-lock.json
            echo "✅ Removed"
        else
            echo "❌ Aborted. You can manually remove the file and try again."
            exit 1
        fi
    fi
else
    echo "✅ No conflicting package-lock.json found"
fi

echo ""
echo "📥 Pulling updates from copilot/finish-project-tasks..."
if git pull origin copilot/finish-project-tasks; then
    echo "✅ Successfully pulled updates!"
    echo ""
    echo "📦 Installing dependencies..."
    cd server
    npm install
    echo ""
    echo "🔒 Checking for vulnerabilities..."
    npm audit
    echo ""
    echo "========================================="
    echo "✅ All done! Your repository is up to date."
    echo "========================================="
else
    echo "❌ Failed to pull updates. Please check the error message above."
    exit 1
fi
