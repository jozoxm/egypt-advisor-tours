# 🚀 Quick Start Guide

## Prerequisites
- Node.js 14+ installed
- npm installed

## Step-by-Step Setup

### 1️⃣ Navigate to Repository Root

Make sure you're in the **egypt-advisor-tours** directory (not in client/ or server/):

**Windows:**
```cmd
cd "D:\save\New folder\egypt-advisor-tours"
```

**Mac/Linux:**
```bash
cd /path/to/egypt-advisor-tours
```

### 2️⃣ Verify You're in the Right Place

Check that you can see package.json:

**Windows:**
```cmd
dir package.json
```

**Mac/Linux:**
```bash
ls package.json
```

✅ If you see package.json, you're in the right place!
❌ If you get "file not found", navigate to the correct directory.

### 3️⃣ Install Dependencies

**Option A: Install Everything** (Recommended for first time)
```bash
npm run install:all
```

**Option B: Install Just Client**
```bash
npm run install:client
```

**Option C: Install Just Server**
```bash
npm run install:server
```

### 4️⃣ Start the Application

**Start Client (React Frontend)**
```bash
npm run start:client
```
Opens at: http://localhost:3000

**Start Server (Backend)**
```bash
npm run start:server
```
Runs at: http://localhost:5000

### 5️⃣ Build for Production

```bash
npm run build
```

## 🔧 Troubleshooting

### "Missing script" Error

**Problem:** You're in the wrong directory!

**Solution:** 
1. Navigate back to repository root
2. Run commands from there

### Common Wrong Directories

❌ **client/public/** - Two levels too deep
❌ **client/** - One level too deep
❌ **server/** - One level too deep
✅ **egypt-advisor-tours/** - Correct!

### How to Get Back to Root

From **any** subdirectory:

**Windows:**
```cmd
cd ..\..
```

**Mac/Linux:**
```bash
cd ../..
```

Or use absolute path:
```cmd
cd "D:\save\New folder\egypt-advisor-tours"
```

## 📋 Available Commands

All these commands must be run from the **root** directory:

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all dependencies (client + server) |
| `npm run install:client` | Install client dependencies only |
| `npm run install:server` | Install server dependencies only |
| `npm run start:client` | Start React development server |
| `npm run start:server` | Start Node.js backend server |
| `npm run build` | Build client for production |
| `npm run test` | Run client tests |

## 🎯 Quick Command Reference

```bash
# First time setup (from root directory)
npm run install:all
npm run start:client

# Development workflow
cd "D:\save\New folder\egypt-advisor-tours"  # Always start here!
npm run start:client                          # Opens http://localhost:3000
```

## 📱 What You Should See

After running `npm run start:client`:
- Browser opens automatically to http://localhost:3000
- You should see the Egypt Advisor Tours homepage
- Logo appears in the top-left corner
- Responsive design works on mobile/tablet/desktop

## ⚡ Common Mistakes

1. **Running commands from client/public/** ❌
   - Solution: `cd ..\..` (Windows) or `cd ../..` (Mac/Linux)

2. **Running commands from client/** ❌
   - Solution: `cd ..`

3. **Not installing dependencies first** ❌
   - Solution: Run `npm run install:client` before `npm run start:client`

## 💡 Pro Tips

- **Always verify your location** with `dir package.json` (Windows) or `ls package.json` (Mac/Linux)
- **Use absolute paths** to avoid confusion: `cd "D:\save\New folder\egypt-advisor-tours"`
- **Bookmark the root directory** in your terminal for quick access
- **Check this guide** if you see "Missing script" errors

## 🆘 Still Having Issues?

1. Check you're in the correct directory (should see package.json)
2. Make sure Node.js is installed: `node --version`
3. Make sure npm is installed: `npm --version`
4. Try removing node_modules and reinstalling:
   ```bash
   npm run clean
   npm run install:all
   ```

---

**Remember:** Always run npm commands from the repository root directory!
