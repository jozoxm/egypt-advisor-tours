#!/bin/bash

# Merge Conflict Resolution Guide
# ================================
# This script resolves common merge conflicts by accepting incoming changes.
# Review each file before accepting so you do not accidentally overwrite work.
# After running this script you MUST review the result and commit manually.

echo "========================================"
echo "MERGE CONFLICT RESOLVER"
echo "========================================"
echo ""
echo "This script will accept incoming ('theirs') changes for the files listed below."
echo "Review each file with 'git diff' or your editor before accepting."
echo ""
echo "Files to be resolved:"
echo "- README.md"
echo "- client/src/App.js"
echo "- client/public/Gold Logo.png"
echo ""
read -p "Press Enter to continue, or Ctrl+C to abort..."

echo ""
echo "Resolving conflicts..."
echo ""

# Accept incoming changes for all conflicted files
if git checkout --theirs README.md 2>/dev/null; then
    echo "✓ README.md resolved"
else
    echo "✗ README.md - no conflict or already resolved"
fi

if git checkout --theirs client/src/App.js 2>/dev/null; then
    echo "✓ client/src/App.js resolved"
else
    echo "✗ client/src/App.js - no conflict or already resolved"
fi

if git checkout --theirs "client/public/Gold Logo.png" 2>/dev/null; then
    echo "✓ client/public/Gold Logo.png resolved"
else
    echo "✗ client/public/Gold Logo.png - no conflict or already resolved"
fi

echo ""
echo "Staging resolved files..."
git add README.md 2>/dev/null
git add client/src/App.js 2>/dev/null
git add "client/public/Gold Logo.png" 2>/dev/null

echo ""
echo "========================================"
echo "CONFLICTS STAGED — ACTION REQUIRED"
echo "========================================"
echo ""
echo "Review the staged changes with: git diff --cached"
echo "Then commit manually when you are satisfied:"
echo "  git commit -m 'Resolve merge conflicts'"
echo ""
echo "Next steps after committing:"
echo "1. Start servers:"
echo "   Terminal 1: npm run start:server"
echo "   Terminal 2: npm run start:client"
echo "2. Hard refresh browser: Ctrl+Shift+R"
echo ""
