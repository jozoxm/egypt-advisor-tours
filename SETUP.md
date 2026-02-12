# 🚀 Setup Guide - Egypt Advisor Tours

## ⚠️ Important: First-Time Setup

Before running the website, you **MUST** install dependencies first!

---

## 🔧 Quick Setup (3 Steps)

### Step 1: Navigate to Client Folder
```bash
cd client
```

### Step 2: Install Dependencies (Required!)
```bash
npm install
```
⏱️ **Wait time:** 2-3 minutes for installation to complete

### Step 3: Start Development Server
```bash
npm start
```
✅ Your browser will automatically open to `http://localhost:3000`

---

## 📋 Complete Commands (Copy & Paste)

### For First Time Setup:
```bash
cd client
npm install
npm start
```

### For Subsequent Runs:
```bash
cd client
npm start
```

---

## ❌ Common Error: 'react-scripts' is not recognized

### Error Message:
```
'react-scripts' is not recognized as an internal or external command,
operable program or batch file.
```

### Cause:
You tried to run `npm start` **before** running `npm install`

### Solution:
```bash
cd client
npm install   # ← You MUST run this first!
npm start
```

---

## 🔄 Troubleshooting

### Problem: Dependencies won't install
**Solution:**
1. Make sure you have Node.js installed (v14 or higher)
2. Check your internet connection
3. Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Problem: Port 3000 is already in use
**Solution:**
Either:
- Stop the other process using port 3000
- Use a different port: `PORT=3001 npm start`

### Problem: npm not found
**Solution:**
Install Node.js from https://nodejs.org/
Node.js includes npm automatically.

---

## 📦 What Gets Installed?

When you run `npm install`, it installs:
- ✅ react-scripts (build tools)
- ✅ React & React DOM
- ✅ React Router
- ✅ Axios
- ✅ And 1,300+ other dependencies

**File size:** ~300MB in `node_modules` folder

---

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install all dependencies (REQUIRED first time) |
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |

---

## 🔍 Verify Installation

After running `npm install`, verify it worked:

```bash
# Check if react-scripts is installed
npm list react-scripts

# Expected output:
# egypt-advisor-tours@1.0.0
# └── react-scripts@5.0.1
```

If you see this, you're all set! ✅

---

## 💡 Pro Tips

1. **Always `npm install` first** - Dependencies are NOT included in the repository
2. **node_modules folder** - This folder is auto-generated and NOT tracked in git
3. **Only install once** - After first install, just use `npm start`
4. **Update dependencies** - Run `npm install` again if package.json changes

---

## 📚 Related Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Quick deployment reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full Hostinger deployment guide
- [PREVIEW.md](./PREVIEW.md) - Website preview with screenshots

---

## ✅ Setup Checklist

- [ ] Node.js installed (check with `node --version`)
- [ ] Navigated to `client` folder
- [ ] Ran `npm install`
- [ ] Waited for installation to complete
- [ ] Ran `npm start`
- [ ] Browser opened to http://localhost:3000
- [ ] Website loads successfully

---

**Having issues?** Check the troubleshooting section above or see [DEPLOYMENT.md](./DEPLOYMENT.md) for more help.

**Last Updated:** February 2026  
**Status:** Production Ready ✅
