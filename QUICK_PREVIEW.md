# 🚀 Quick Reference - Preview Website

## One-Command Preview

### Windows
```cmd
preview.bat
```

### Mac/Linux
```bash
./preview.sh
```

## Manual Preview

### Terminal 1 - Backend
```bash
cd server
npm install
npm run seed       # Add sample tours
npm start          # Runs on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd client
npm install
npm start          # Opens http://localhost:3000
```

## URLs
- **Website**: http://localhost:3000
- **API**: http://localhost:5000

## Stop Servers
Press `Ctrl+C` in each terminal window

## Troubleshooting
See **HOW_TO_PREVIEW.md** for detailed help

## Prerequisites
- Node.js v14+ ([Download](https://nodejs.org/))
- MongoDB (optional - [Atlas](https://www.mongodb.com/cloud/atlas))

---

**That's it!** Your website will open automatically in your browser at http://localhost:3000 🎉
