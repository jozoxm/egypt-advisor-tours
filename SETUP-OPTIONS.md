# 🎯 Setup Options - Egypt Advisor Tours

## Three Ways to Get Started

### 🌟 Option 1: Automated Setup (Recommended)
**Perfect for beginners - everything is automatic!**

| Platform | Command | What It Does |
|----------|---------|--------------|
| Windows | `setup.bat` | Installs dependencies + starts server |
| Mac/Linux | `./setup.sh` | Installs dependencies + starts server |

**Advantages:**
- ✅ One command does everything
- ✅ Checks for Node.js installation
- ✅ Shows progress messages
- ✅ Handles errors gracefully
- ✅ Perfect for first-time users

---

### 📋 Option 2: Manual Setup (Traditional)
**For users who prefer control**

```bash
cd client
npm install    # Install dependencies (2-3 minutes)
npm start      # Start development server
```

**Advantages:**
- ✅ See exactly what's happening
- ✅ Can troubleshoot each step
- ✅ Works on any system

---

### ⚡ Option 3: Quick Commands
**For experienced developers**

```bash
# One-liner for Unix/Mac
cd client && npm install && npm start

# Or use the automation scripts
./setup.sh    # Mac/Linux
setup.bat     # Windows
```

---

## 🆘 Still Getting Errors?

### Error: `'react-scripts' is not recognized`

**Cause:** Dependencies not installed

**Solution:** 
1. Run the automated setup script: `./setup.sh` or `setup.bat`
2. Or manually: `cd client && npm install`

### Error: `Node.js not found`

**Cause:** Node.js not installed on your system

**Solution:**
1. Download from https://nodejs.org/
2. Install Node.js (includes npm)
3. Restart your terminal
4. Run setup script again

### Error: `Permission denied: ./setup.sh`

**Cause:** Script not executable (Mac/Linux only)

**Solution:**
```bash
chmod +x setup.sh
./setup.sh
```

---

## 📚 More Help

- [SETUP.md](./SETUP.md) - Detailed setup guide
- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy to Hostinger
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference

---

## ✅ Success Checklist

After running setup, you should see:

- [ ] Message: "Dependencies installed successfully"
- [ ] Message: "Starting development server"
- [ ] Browser opens automatically
- [ ] Website loads at `http://localhost:3000`
- [ ] No error messages

If all checkboxes are ✅, you're ready to develop!

---

**Last Updated:** February 2026  
**Status:** Ready for Use ✅
