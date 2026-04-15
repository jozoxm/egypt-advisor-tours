#!/bin/bash
# Resolve CSS Merge Conflict - Unix Script
# This script resolves the App.css merge conflict by accepting incoming changes

echo ""
echo "========================================"
echo "  Resolving CSS Merge Conflict"
echo "========================================"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "ERROR: Not in a git repository!"
    echo "Please run this from the egypt-advisor-tours directory."
    exit 1
fi

echo "Step 1: Accepting incoming changes for App.css..."
if ! git checkout --theirs client/src/App.css; then
    echo "ERROR: Failed to checkout incoming version!"
    echo "Make sure you have a merge conflict in client/src/App.css"
    exit 1
fi
echo "✓ Incoming CSS accepted"

echo ""
echo "Step 2: Staging resolved file..."
if ! git add client/src/App.css; then
    echo "ERROR: Failed to stage file!"
    exit 1
fi
echo "✓ File staged"

echo ""
echo "Step 3: Committing merge..."
if ! git commit -m "Resolve CSS merge conflict - accept incoming UI improvements"; then
    echo "ERROR: Failed to commit!"
    exit 1
fi
echo "✓ Merge committed"

echo ""
echo "========================================"
echo "  ✓ CSS Conflict Resolved!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. cd client"
echo "  2. npm install"
echo "  3. cd .."
echo "  4. npm run start:server (in Terminal 1)"
echo "  5. npm run start:client (in Terminal 2)"
echo "  6. Hard refresh browser 3x (Cmd+Shift+R)"
echo ""
echo "See RESOLVE-CSS-CONFLICT.md for details"
echo ""
