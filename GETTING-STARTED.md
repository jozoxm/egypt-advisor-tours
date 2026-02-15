# Getting Started with Egypt Advisor Tours

This guide will help you set up and run the Egypt Advisor Tours project on your local machine.

## Prerequisites

Before you begin, make sure you have:
- Node.js (version 14.0.0 or higher)
- npm (comes with Node.js)
- Git

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/jozoxm/egypt-advisor-tours.git
cd egypt-advisor-tours
```

**✅ CHECKPOINT:** Run `pwd` (Mac/Linux) or `cd` (Windows) to verify you're in the root directory. You should see:
- Mac/Linux: `/path/to/egypt-advisor-tours`
- Windows: `X:\path\to\egypt-advisor-tours`

**❌ If you see `/client` or `/server` at the end, you're in the wrong directory!**

### Step 2: Install All Dependencies

From the **root directory** (where you just cloned the repo), run:

```bash
npm run install:all
```

This will:
1. Install root dependencies
2. Navigate to `client/` and install React dependencies
3. Navigate to `server/` and install Node.js dependencies

**⏱️ This may take 2-5 minutes depending on your internet speed.**

### Step 3: Start the Application

#### Option A: Start Both Client and Server (Recommended)

Open TWO terminal windows:

**Terminal 1 - Start the Client:**
```bash
# From root directory
npm run start:client
```
The React app will open at http://localhost:3000

**Terminal 2 - Start the Server:**
```bash
# From root directory
npm run start:server
```
The API will run at http://localhost:5000

#### Option B: Start Only the Client
```bash
# From root directory
npm run start:client
```

#### Option C: Start Only the Server
```bash
# From root directory
npm run start:server
```

## Understanding the Project Structure

```
egypt-advisor-tours/              ← YOU ARE HERE (root directory)
│
├── package.json                 ← Root package.json with convenience scripts
├── README.md                    ← Main documentation
├── GETTING-STARTED.md          ← This file
├── STATUS.md                    ← Repository health status
├── SECURITY.md                  ← Security information
│
├── client/                      ← React Frontend
│   ├── package.json            ← Client-specific dependencies
│   ├── src/                    ← React source code
│   └── public/                 ← Public assets
│
└── server/                      ← Node.js Backend
    ├── package.json            ← Server-specific dependencies
    ├── index.js                ← Server entry point
    └── .env.example            ← Environment variables template
```

## Common Commands

**⚠️ All commands must be run from the ROOT directory!**

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all dependencies (client + server) |
| `npm run start:client` | Start React development server |
| `npm run start:server` | Start Node.js API server |
| `npm run build` | Build React app for production |
| `npm run test:client` | Run client tests |
| `npm run clean` | Remove all node_modules and start fresh |

## Where Should I Run Commands?

### ✅ DO: Run from Root Directory

```bash
# Correct location
egypt-advisor-tours> npm run install:all    ✅
egypt-advisor-tours> npm run start:client   ✅
egypt-advisor-tours> npm run start:server   ✅
```

### ❌ DON'T: Run from Client or Server Directories

```bash
# Wrong locations
egypt-advisor-tours/client> npm run install:all   ❌ Script doesn't exist here!
egypt-advisor-tours/server> npm run start:client  ❌ Script doesn't exist here!
```

### When to Work in Client/Server Directories?

Only navigate into `client/` or `server/` when you're:
- Editing code files
- Adding new dependencies with `npm install <package>` in that specific directory
- Running package-specific commands that don't exist in root

**For all other tasks, stay in the root directory!**

## Quick Reference Card

Print this out or save it for reference:

```
┌─────────────────────────────────────────────────────────┐
│  EGYPT ADVISOR TOURS - QUICK REFERENCE                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📁 Always run commands from ROOT directory             │
│                                                         │
│  ✅ Setup:                                              │
│     1. cd egypt-advisor-tours                           │
│     2. npm run install:all                              │
│                                                         │
│  ✅ Development:                                        │
│     Terminal 1: npm run start:client                    │
│     Terminal 2: npm run start:server                    │
│                                                         │
│  ✅ If something breaks:                                │
│     npm run clean                                       │
│     npm run install:all                                 │
│                                                         │
│  🌐 URLs:                                               │
│     Client: http://localhost:3000                       │
│     Server: http://localhost:5000                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Problem: "Missing script: 'install:all'"

**Cause:** You're in the `client/` or `server/` directory, not root.

**Fix:**
```bash
cd ..  # Go up one level to root
npm run install:all
```

### Problem: "'react-scripts' is not recognized"

**Cause:** Dependencies aren't installed.

**Fix:**
```bash
# Make sure you're in root directory first!
npm run install:all
```

### Problem: "Cannot find module 'express'" or "Cannot find module [...]/server/index.js"

**Cause:** Server dependencies aren't installed.

**Fix:**
```bash
# From root directory
npm run install:all

# Or install only server dependencies
npm run install:server
```

The server includes a pre-start check that will show a helpful error message if dependencies are missing.

### Problem: Port already in use

**Cause:** Another process is using port 3000 or 5000.

**Fix:**
- **Option 1:** Stop the other process
- **Option 2:** Change the port in server/.env (for server)
- **Option 3:** React will prompt you to use a different port automatically

### Problem: Build fails or unexpected errors

**Cause:** Corrupted dependencies or cache.

**Fix:**
```bash
npm run clean      # Remove all dependencies
npm run install:all # Reinstall everything
```

## Next Steps

Once everything is running:

1. Open http://localhost:3000 in your browser
2. Explore the website
3. Check the code in `client/src/` and `server/` directories
4. Make your changes
5. See them live-reload in the browser!

## Getting Help

- 📖 Read README.md for detailed information
- 🔒 Check SECURITY.md for security status
- 📊 Check STATUS.md for repository health
- 🐛 Report issues: https://github.com/jozoxm/egypt-advisor-tours/issues

---

**Happy Coding! 🎉**
