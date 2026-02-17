# 📚 Command Reference Guide

Quick reference for all essential commands you'll need while working on Egypt Advisor Tours.

> **Important:** Always run commands from the repository root directory!
> 
> Your path should be: `D:\save\New folder\egypt-advisor-tours\`

---

## 📍 Navigation Commands

### Get to Repository Root

**Windows:**
```cmd
cd "D:\save\New folder\egypt-advisor-tours"
```

**Mac/Linux:**
```bash
cd /path/to/egypt-advisor-tours
```

### Verify You're in the Right Place
```bash
# Should show package.json
dir package.json     # Windows
ls package.json      # Mac/Linux
```

---

## 🔄 Git Commands - Pull & Update

### Pull Latest Changes from GitHub

```bash
# Fetch and pull all changes
git pull origin copilot/add-logo-mobile-responsiveness

# Or if on main branch
git pull origin main
```

### Check Current Branch
```bash
git branch
# Shows which branch you're on (marked with *)
```

### Switch to a Branch
```bash
# Switch to the working branch
git checkout copilot/add-logo-mobile-responsiveness

# Switch to main
git checkout main
```

### Update Branch with Latest Changes
```bash
# If you're already on the branch
git pull

# Force update (careful - overwrites local changes!)
git fetch origin
git reset --hard origin/copilot/add-logo-mobile-responsiveness
```

---

## 📤 Git Commands - Push Changes

### Basic Push Workflow

**1. Check Status**
```bash
git status
# Shows what files changed
```

**2. Add Files**
```bash
# Add all changes
git add .

# Add specific file
git add "client/public/Gold Logo.png"
git add client/src/App.js

# IMPORTANT: Use forward slashes / not backslashes \
```

**3. Commit Changes**
```bash
git commit -m "Your commit message here"

# Examples:
git commit -m "Update logo styling"
git commit -m "Fix mobile responsiveness"
```

**4. Push to GitHub**
```bash
git push origin copilot/add-logo-mobile-responsiveness

# Or if on main
git push origin main
```

### Quick Push (All in One)
```bash
git add .
git commit -m "Your message"
git push origin copilot/add-logo-mobile-responsiveness
```

---

## 🔍 Check What Changed

### View Changes
```bash
# See what files changed
git status

# See actual code changes
git diff

# See changes in specific file
git diff client/src/App.js
```

### View Commit History
```bash
# Recent commits
git log --oneline -10

# Detailed view
git log
```

---

## 📦 Install Dependencies

### First Time Setup or After Pull
```bash
# Install everything (client + server)
npm run install:all

# Or install just client
npm run install:client

# Or install just server
npm run install:server
```

### When to Install
- ✅ After cloning the repository
- ✅ After pulling changes (if package.json changed)
- ✅ When you see "module not found" errors
- ✅ Before running the application first time

---

## 🚀 Run & Preview Application

### Start Development Server

**Option 1: Client Only (React Frontend)**
```bash
npm run start:client
```
- Opens: http://localhost:3000
- Auto-reloads when you save changes
- Press `Ctrl+C` to stop

**Option 2: Server Only (Backend)**
```bash
npm run start:server
```
- Runs on: http://localhost:5000
- Press `Ctrl+C` to stop

**Option 3: Both Client & Server**
```bash
# Terminal 1:
npm run start:client

# Terminal 2 (new terminal):
npm run start:server
```

### Build for Production
```bash
npm run build
```
- Creates optimized production build
- Output: `client/build/`
- Use this for deployment

---

## 🐛 Troubleshooting Commands

### Fix "Missing Script" Error

**Problem:** You're in the wrong directory!

```bash
# Go back to root
cd ..              # If in client/ or server/
cd ../..           # If in client/public/

# Then verify
dir package.json   # Windows
ls package.json    # Mac/Linux
```

### Fix "Module Not Found" Error
```bash
# Reinstall dependencies
npm run install:all

# Or clean install
rm -rf client/node_modules    # Mac/Linux
rm -rf server/node_modules
npm run install:all

# Windows:
rmdir /s client\node_modules
rmdir /s server\node_modules
npm run install:all
```

### Fix Port Already in Use
```bash
# Find and kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Clear Browser Cache
```bash
# After updating logo or assets
# In browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

## 🔄 Common Workflows

### Daily Development Workflow
```bash
# 1. Navigate to project
cd "D:\save\New folder\egypt-advisor-tours"

# 2. Pull latest changes
git pull origin copilot/add-logo-mobile-responsiveness

# 3. Install any new dependencies (if needed)
npm run install:client

# 4. Start development server
npm run start:client

# 5. Make changes and save files
# (Server auto-reloads)

# 6. When done, commit changes
git add .
git commit -m "Describe your changes"
git push origin copilot/add-logo-mobile-responsiveness
```

### Update Logo Workflow
```bash
# 1. Replace logo file in client/public/
# Copy your new "Gold Logo.png" to:
# D:\save\New folder\egypt-advisor-tours\client\public\

# 2. Refresh browser (hard refresh)
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# 3. If it doesn't update, update the code with cache-busting
# Change in App.js: src="/Gold Logo.png?v=3"
# (increment version number)

# 4. Commit the change
git add "client/public/Gold Logo.png"
git commit -m "Update logo"
git push origin copilot/add-logo-mobile-responsiveness
```

### Deploy to Production Workflow
```bash
# 1. Build production version
npm run build

# 2. Test the build locally
cd client/build
# Open index.html in browser

# 3. If using Vercel, it auto-deploys from GitHub
# Just push your changes:
git push origin main
```

---

## 📋 Available npm Scripts

Run these from **repository root** only:

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all dependencies (client + server) |
| `npm run install:client` | Install client dependencies only |
| `npm run install:server` | Install server dependencies only |
| `npm run start:client` | Start React dev server (localhost:3000) |
| `npm run start:server` | Start Node.js backend (localhost:5000) |
| `npm run build` | Build client for production |
| `npm run test` | Run client tests |

---

## ⚡ Quick Reference Card

```bash
# NAVIGATION
cd "D:\save\New folder\egypt-advisor-tours"

# PULL UPDATES
git pull origin copilot/add-logo-mobile-responsiveness

# PUSH CHANGES
git add .
git commit -m "Your message"
git push origin copilot/add-logo-mobile-responsiveness

# RUN APPLICATION
npm run start:client

# BUILD PRODUCTION
npm run build
```

---

## 🆘 Emergency Commands

### Discard All Local Changes
```bash
# WARNING: This deletes all uncommitted changes!
git reset --hard HEAD
git clean -fd
```

### Start Fresh (Nuclear Option)
```bash
# 1. Delete everything except .git
# 2. Pull fresh copy
git fetch origin
git reset --hard origin/copilot/add-logo-mobile-responsiveness

# 3. Reinstall dependencies
npm run install:all
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

---

## 💡 Pro Tips

1. **Always verify your directory** before running commands
   ```bash
   dir package.json     # Windows
   ls package.json      # Mac/Linux
   ```

2. **Use Git status often** to see what's changed
   ```bash
   git status
   ```

3. **Pull before push** to avoid conflicts
   ```bash
   git pull
   git push
   ```

4. **Use forward slashes** in git commands
   ```bash
   ✅ git add client/public/logo.png
   ❌ git add client\public\logo.png
   ```

5. **Hard refresh browser** after logo changes
   ```
   Ctrl+Shift+R (Windows)
   Cmd+Shift+R (Mac)
   ```

6. **Check running processes** before starting server
   ```bash
   # If port is busy, kill the process first
   netstat -ano | findstr :3000   # Windows
   lsof -ti:3000                   # Mac/Linux
   ```

---

## 📞 Need More Help?

- **Quick Start:** See `QUICK-START-GUIDE.md`
- **Git Issues:** See `GIT-WORKFLOW-GUIDE.md`
- **Directory Issues:** See `client/README.md` or `client/public/README.md`
- **Main README:** See `README.md`

---

**Last Updated:** February 17, 2026

**Bookmark this file!** You can always find it at the repository root:
`D:\save\New folder\egypt-advisor-tours\COMMAND-REFERENCE.md`
