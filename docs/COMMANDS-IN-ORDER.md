# 📋 Exact Commands to Follow in Order

## 🚀 Quick Start - Full Control Admin Panel

Follow these exact commands to get the Full Control Admin Panel running:

---

## ✅ First Time Setup (Do Once)

### Step 1: Install Dependencies

Open your terminal/command prompt and run:

```bash
# Navigate to project directory
cd egypt-advisor-tours

# Install all dependencies (client + server)
npm run install:all
```

**Wait for:** This will take 1-2 minutes. You'll see "added X packages" when done.

---

## 🎯 Every Time You Want to Use the Admin Panel

You need **TWO terminal windows** open at the same time:

### Terminal 1 - Start Backend Server

```bash
# In Terminal 1
cd egypt-advisor-tours
npm run start:server
```

**You should see:**
```
Server is running on port 5000
```

**Keep this terminal open!** Don't close it.

---

### Terminal 2 - Start Website

```bash
# In Terminal 2 (open a NEW terminal window)
cd egypt-advisor-tours
npm run start:client
```

**You should see:**
```
Compiled successfully!
Local:            http://localhost:3000
```

**Keep this terminal open too!**

---

### Step 3: Open in Browser

1. Open your web browser (Chrome, Firefox, Edge, Safari)
2. Go to: `http://localhost:3000`
3. Click "🎨 Admin" in the top navigation bar
4. Start editing!

---

## 🎨 Using the Admin Panel

Once the Admin Panel is open:

### To Edit Tours:
1. Click "🎫 Edit Tours" tab
2. Click "✏️ Edit This Tour" on any tour
3. Change the details (name, price, description, etc.)
4. Click "Save Changes"
5. ✅ See green success message!

### To Edit Contact Info:
1. Click "📞 Edit Contact Info" tab
2. Type in any field
3. ✅ Saves automatically!

---

## ⏹️ When You're Done

To stop the servers:

**In each terminal:**
```bash
# Press Ctrl+C (Windows/Linux/Mac)
```

---

## 📝 Complete Command Reference

### Installation Commands:
```bash
npm run install:all       # Install all dependencies
npm run install:client    # Install only client dependencies
npm run install:server    # Install only server dependencies
```

### Running Commands:
```bash
npm run start:client      # Start React frontend (port 3000)
npm run start:server      # Start backend API (port 5000)
```

### Build Commands:
```bash
npm run build             # Build production version
```

---

## 🔍 Troubleshooting Commands

### Check if servers are running:
```bash
# Check if port 3000 is in use (client)
lsof -i :3000             # Mac/Linux
netstat -ano | findstr :3000   # Windows

# Check if port 5000 is in use (server)
lsof -i :5000             # Mac/Linux
netstat -ano | findstr :5000   # Windows
```

### Kill a stuck server:
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti :3000 | xargs kill

# Kill process on port 5000 (Mac/Linux)
lsof -ti :5000 | xargs kill

# Windows: use Task Manager or:
taskkill /F /PID <process_id>
```

---

## 💡 Common Issues & Solutions

### Issue: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Port 3000 is already in use"
**Solution:**
1. Close other apps using port 3000
2. Or kill the process (see troubleshooting above)
3. Or use a different port: `PORT=3001 npm run start:client`

### Issue: "Port 5000 is already in use"
**Solution:**
1. Close other apps using port 5000
2. Or kill the process (see troubleshooting above)

### Issue: "Cannot find module..."
**Solution:**
```bash
cd egypt-advisor-tours
npm run install:all
```

### Issue: Admin Panel shows "Failed to connect to server"
**Solution:**
1. Make sure Terminal 1 (backend server) is running
2. Check that you see "Server is running on port 5000"
3. Restart the backend: `npm run start:server`

---

## 🎓 What Each Command Does

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `npm run install:all` | Installs all dependencies for client and server | First time setup, or after pulling new code |
| `npm run start:client` | Starts React development server on port 3000 | Every time you want to view the website |
| `npm run start:server` | Starts backend API server on port 5000 | Every time you want to use the Admin Panel |
| `npm run build` | Creates production-ready build | Before deploying to live server |

---

## 📁 Where You Are

Always run commands from the **project root** directory:

```
egypt-advisor-tours/          ← YOU ARE HERE (run commands here)
├── client/                   ← React frontend
├── server/                   ← Express backend
├── package.json              ← Root package file
└── README.md
```

**If you're in the wrong directory:**
```bash
# Go back to root
cd ..

# Or go directly to root
cd ~/egypt-advisor-tours
```

---

## 🎯 Quick Start Checklist

Use this checklist every time:

- [ ] Open Terminal 1
- [ ] Run: `cd egypt-advisor-tours`
- [ ] Run: `npm run start:server`
- [ ] See: "Server is running on port 5000"
- [ ] Open Terminal 2 (NEW window)
- [ ] Run: `cd egypt-advisor-tours`
- [ ] Run: `npm run start:client`
- [ ] See: "Compiled successfully!"
- [ ] Open browser to `http://localhost:3000`
- [ ] Click "🎨 Admin" in navigation
- [ ] Start editing!

---

## 📚 Additional Resources

- **[Full Control Admin Guide](NO-CODE-ADMIN-GUIDE.md)** - Complete admin panel documentation
- **[Beginner's Guide](BEGINNER-GUIDE.md)** - Detailed guide for beginners
- **[Quick Edit Guide](QUICK-EDIT-GUIDE.md)** - Fast reference for edits
- **[Admin Link Troubleshooting](ADMIN-LINK-TROUBLESHOOTING.md)** - Can't find Admin link?

---

## 🆘 Need More Help?

If something isn't working:
1. Read the error message carefully
2. Check the troubleshooting section above
3. Try restarting both servers (Ctrl+C and start again)
4. Make sure you're in the correct directory
5. Make sure dependencies are installed: `npm run install:all`

---

**Last Updated:** February 2026

**Questions?** See the guides listed above for more detailed help!
