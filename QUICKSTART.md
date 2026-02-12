# 🚀 Quick Start - Preview & Deploy

## 📱 Preview Website Locally

### Option 1: Development Mode (for testing changes)

```bash
cd client
npm install
npm start
```

Your browser will open at `http://localhost:3000`

### Option 2: Production Preview (test the built version)

```bash
cd client
npm install
npm run build
npx serve -s build
```

Visit `http://localhost:3000` to preview

---

## 🌐 Deploy to Hostinger - Quick Steps

### 1️⃣ Build Production Version

```bash
cd client
npm run build
```

### 2️⃣ Upload to Hostinger

**Files to upload:** Everything inside the `client/build/` folder

**Where to upload:** `/public_html/` directory on your Hostinger server

**How to upload:**
- **Easy way:** Use Hostinger File Manager (in your dashboard)
- **Pro way:** Use FileZilla FTP client

### 3️⃣ Configure Domain & SSL

1. Point your domain to Hostinger nameservers
2. Add domain in Hostinger dashboard
3. Install Free SSL certificate
4. Wait for DNS propagation (up to 48 hours)

### 4️⃣ Test Your Live Site

Visit: `https://egyptadvisortours.com`

---

## 📂 What to Upload

Upload **ALL** files from `client/build/` folder:

```
build/
├── index.html              ← Main file (REQUIRED)
├── asset-manifest.json     ← Build manifest (REQUIRED)
├── .htaccess               ← React Router config (REQUIRED)
└── static/                 ← All assets (REQUIRED)
    ├── css/
    │   └── main.[hash].css
    ├── js/
    │   └── main.[hash].js
    └── media/
```

⚠️ **Important:** Upload to `/public_html/` root, NOT a subdirectory!

---

## 🔧 Essential .htaccess Configuration

The `.htaccess` file is already included in `client/public/` and will be automatically copied to the build folder.

This file ensures React Router works correctly on the server.

---

## 📞 Quick Help

**Hostinger Support:** Available 24/7 via live chat

**Common Issues:**
- Blank page? → Check `index.html` is in root
- 404 errors? → Upload `.htaccess` file
- SSL not working? → Wait 10-15 minutes after installation

---

## ✅ Deployment Checklist

- [ ] `npm run build` completed successfully
- [ ] All files from `build/` folder uploaded
- [ ] `.htaccess` file uploaded
- [ ] Domain pointed to Hostinger
- [ ] SSL certificate installed
- [ ] Website accessible via https://
- [ ] All pages working correctly
- [ ] Mobile version tested

---

**For detailed instructions, see:** [DEPLOYMENT.md](./DEPLOYMENT.md)

**Estimated deployment time:** 15-20 minutes
