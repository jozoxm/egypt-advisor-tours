# Egypt Advisor Tours

A full-stack tour-operator website built with React (frontend) and Express/Node.js (backend), deployed on Hostinger.

**Live site:** [https://egyptadvisortours.com](https://egyptadvisortours.com)

---

## Quick start (local development)

```bash
# 1. Clone the repo
git clone https://github.com/jozoxm/egypt-advisor-tours.git
cd egypt-advisor-tours

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Install all dependencies (also builds the React client)
npm install

# 4. Start the server (API + serves the React build)
npm start
```

> **⚠️ Important — run only one process at a time:**
> Always use `npm start` at the **repository root**. This launches both the CMS
> (Payload, port 3001) and the Express server (port 5000) in one coordinated
> process. **Never** run `npm run start --prefix cms` (or `cd cms && npm start`)
> at the same time as the root `npm start`; both will try to bind port 3001 and
> the second one will fail with `EADDRINUSE`.

> **Port 3001 stuck / left dangling?**
> If you interrupted a previous run and port 3001 is still occupied, find and
> kill the process before restarting:
>
> ```bash
> # Linux / macOS
> lsof -ti tcp:3001 | xargs kill -9
>
> # Windows (PowerShell)
> Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
> ```
>
> `npm start` will also detect a pre-occupied port 3001 automatically and skip
> re-spawning the CMS — it will just wait for the already-running CMS process
> to respond before starting Express.

Or run frontend and backend in parallel for hot-reload during development:

```bash
# Terminal 1 – Express API
npm run dev          # starts server on http://localhost:5000

# Terminal 2 – React dev server (proxies /api/* to :5000)
cd client && npm start
```

### Docker (optional)

```bash
cp .env.example .env      # fill in secrets
docker-compose up --build  # starts the app on http://localhost:5000
```

---

## Documentation

| Document | Description |
|---|---|
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Local setup, project structure, adding features |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Hostinger deploy guide, GitHub Secrets, env vars |
| [docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md) | Using the admin panel to manage content |
| [docs/SECURITY.md](docs/SECURITY.md) | Auth model, secrets, security checklist |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, EmailJS |
| Backend | Node.js 20, Express 4, JWT auth, Helmet |
| Data | JSON files on disk (server/data/), seeded from static JS on startup |
| Deploy | Hostinger Node.js hosting, GitHub Actions |

---

## Contributing

1. Create a feature branch off `main`
2. Run `npm run test:all` locally before opening a PR
3. CI runs the full test suite before deploying

---

## 🚨 CAN'T SEE THE ADMIN BUTTON?

**Follow these steps RIGHT NOW:** [docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md)

**Quick Fix:**
```bash
# 1. Pull latest changes
git pull

# 2. Hard refresh browser (do this 3 times!)
Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

# 3. Check console (F12) - should show: Version 1.0.2
```

---

## 🚨 SCRIPT NOT FOUND?

**Getting "'resolve-css-conflict.bat' is not recognized" error?**

See **[MISSING-SCRIPTS-FIX.md](MISSING-SCRIPTS-FIX.md)** for complete fix!

**Quick Fix:**
```bash
# Switch to the correct branch
git checkout copilot/remove-video-from-hero
git pull origin copilot/remove-video-from-hero

# Or resolve manually without scripts
git checkout --theirs client/src/App.css
git add client/src/App.css
git commit -m "Resolve CSS conflict"
```

**Manual Resolution:** See [CSS-CONFLICT-MANUAL.md](CSS-CONFLICT-MANUAL.md)

---

## 🚀 Quick Start - Commands in Order

**Need the exact commands to follow?** See **[COMMANDS-IN-ORDER.md](COMMANDS-IN-ORDER.md)** for a step-by-step guide!

**TL;DR:**
```bash
# Terminal 1:
npm run start:server

# Terminal 2:
npm run start:client

# Then open: http://localhost:3000
```

---

## 🎨 Full Control Admin Panel - NEW!

**Want to edit without ANY coding?** We now have a **Full Control Admin Panel with automatic saving**!

- 🖱️ **[Full Control Admin Guide](NO-CODE-ADMIN-GUIDE.md)** - Edit with automatic saving (EASIEST!)
- 📖 **[Quick Edit Guide](QUICK-EDIT-GUIDE.md)** - Edit data files directly
- 📚 **[Beginner's Guide](BEGINNER-GUIDE.md)** - Complete guide with step-by-step instructions

**How to use the Full Control Panel:**
1. Start backend server: `npm run start:server`
2. Start website: `npm run start:client`  
3. Click "🎨 Admin" in navigation
4. Edit and save - changes persist automatically!

**No copy/paste, no manual file editing - just click and save!** ✨

---

## 🎓 For Beginners: How to Edit This Website

**New to coding?** We've made it easy for you!

All the data is organized in easy-to-edit files - no complex coding required!

---

## Project Overview
Egypt Advisor Tours is a travel agency website designed to help travelers plan their visits to Egypt with ease. It provides useful information about various tours, attractions, accommodations, and travel tips to create unforgettable experiences.

## Installation Instructions

### Quick Start (Recommended)
1. Clone the repository:  
   ```bash
   git clone https://github.com/jozoxm/egypt-advisor-tours.git
   ```
2. Navigate to the project directory:  
   ```bash
   cd egypt-advisor-tours
   ```
3. Install all dependencies (client and server):  
   ```bash
   npm run install:all
   ```
4. Start the development server:  
   ```bash
   npm start
   ```

### Alternative: Install Client Only
If you only want to run the frontend:
```bash
cd egypt-advisor-tours
npm run install:client
npm start
```

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

## Features
- Comprehensive tour listings with detailed descriptions
- User-friendly interface with easy navigation
- Booking system for tours and accommodations
- Customer reviews and ratings for each tour
- Blog section for travel tips and advice
- Multi-language support
