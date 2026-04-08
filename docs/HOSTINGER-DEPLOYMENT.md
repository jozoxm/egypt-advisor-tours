# 🏨 Hostinger Deployment Guide — Egypt Advisor Tours

This guide walks you through uploading your Egypt Advisor Tours website to **Hostinger** hosting, step by step. No advanced coding knowledge required!

---

## 📋 Before You Start — Choose Your Hosting Plan

Your website has **two parts**:

| Part | What it does | Hosting needed |
|---|---|---|
| **Frontend** (React) | The pages visitors see — homepage, tours, contact | Any hosting plan |
| **Backend** (Node.js server) | Admin panel saves, API for data management | **VPS, Cloud, or free Node.js platform** (Railway, Render) |

> **💡 Quick recommendation for beginners:**
> - **Just want the website visible online?** → Use **Option A** (Shared Hosting). Simple 10-minute setup.
> - **Want the Admin Panel to save changes, for free?** → Use **Option C** (Railway — free). No VPS needed.
> - **Want full control on Hostinger VPS?** → Use **Option B** (VPS Hosting). More steps, but you own the server.

---

## ✅ What You Need Before Starting

- A **Hostinger account** — [hostinger.com](https://www.hostinger.com) (any plan)
- Your website **files on your computer** (the folder you've been working in)
- **Node.js** installed on your computer — [nodejs.org](https://nodejs.org) (download the "LTS" version)
- About **20–30 minutes** of free time

---

## 🟢 OPTION A — Shared Hosting (Beginner-Friendly, Frontend Only)

> Use this if you have Hostinger's **Shared, Business, or Premium** plan.
> The website will be fully visible and usable by visitors. The Admin Panel will work for viewing, but saving changes requires Option B.

### Step 1 — Build Your Website on Your Computer

The website needs to be "compiled" into regular HTML/CSS/JS files before uploading.

**On Windows:**

1. Press `Windows + R`, type `cmd`, press Enter to open the Command Prompt
2. Navigate to your project folder:
   ```
   cd C:\path\to\egypt-advisor-tours
   ```
   *(Replace the path with where your project folder actually is)*
3. Run:
   ```
   npm run build
   ```
4. Wait for it to finish — you'll see **"Compiled successfully!"**

**On Mac/Linux:**

1. Open Terminal
2. Navigate to your project folder:
   ```
   cd /path/to/egypt-advisor-tours
   ```
3. Run:
   ```
   npm run build
   ```
4. Wait for **"Compiled successfully!"**

✅ A new folder called **`client/build`** will be created. This is your website, ready to upload.

---

### Step 2 — Check the `.htaccess` File Is Included ✅

This file tells the server how to handle page navigation. Without it, pages like `/tours` will show a 404 error.

**Good news — it's already set up for you!** The file `client/public/.htaccess` is included in this project and will be **automatically copied** into `client/build/` every time you run `npm run build`.

After building, verify it's there:
1. Open the `client/build` folder on your computer
2. You should see a file named **`.htaccess`**

> **💡 Note:** On Windows, files starting with a dot (`.`) may be hidden. In File Explorer, go to View → check "Hidden items" to see them.

If for any reason the file is missing, create a new file named `.htaccess` inside `client/build/` and paste:

```apacheconf
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

### Step 3 — Log In to Hostinger hPanel

1. Go to **[hpanel.hostinger.com](https://hpanel.hostinger.com)**
2. Sign in with your Hostinger email and password
3. Click on your hosting plan to open it

---

### Step 4 — Upload Your Website Files

**Method 1: File Manager (Easiest)**

1. In hPanel, find and click **File Manager**
2. Open the **`public_html`** folder (this is where your website lives)
3. Delete everything currently in `public_html` (if it's a fresh hosting account, it may have a default placeholder page — delete it)
4. Click **Upload** button
5. Select ALL the files and folders inside your `client/build` folder
   - Select everything: `Ctrl+A` (Windows) or `Cmd+A` (Mac)
   - Upload them all at once

> **Important:** Upload the *contents* of `client/build`, not the folder itself.
> Your `public_html` should contain: `index.html`, `static/`, `asset-manifest.json`, etc.

**Method 2: FTP (Recommended for large uploads)**

1. In hPanel, go to **Files → FTP Accounts**
2. Note your FTP hostname, username, and port (usually 21)
3. Download and install **FileZilla** (free): [filezilla-project.org](https://filezilla-project.org)
4. Open FileZilla and connect:
   - Host: your FTP hostname (e.g. `ftp.yourdomain.com`)
   - Username: your FTP username
   - Password: your FTP password
   - Port: `21`
5. Click **Quickconnect**
6. In the left panel (your computer), navigate to `client/build`
7. In the right panel (Hostinger server), open `public_html`
8. Select all files on the left → drag them to the right panel
9. Wait for the upload to complete

---

### Step 5 — Set Up Environment Variables (for Email/Booking Forms)

If you want the booking and trip-tailor forms to send emails, you need to add your EmailJS configuration.

1. In hPanel, go to **Hosting → Manage → Configuration**
2. Look for **PHP Configuration** or **Environment Variables**
3. Add these variables (with your real values from [emailjs.com](https://www.emailjs.com)):

   | Variable Name | Your Value |
   |---|---|
   | `REACT_APP_EMAILJS_SERVICE_ID` | Your EmailJS Service ID |
   | `REACT_APP_EMAILJS_BOOKING_TEMPLATE_ID` | Your Booking Template ID |
   | `REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID` | Your Trip Tailor Template ID |
   | `REACT_APP_EMAILJS_PUBLIC_KEY` | Your EmailJS Public Key |

> **Note:** Since React compiles environment variables at build time, the easiest approach is to create a `.env.production` file in the `client/` folder before running `npm run build` in Step 1.
>
> Create `client/.env.production`:
> ```
> REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
> REACT_APP_EMAILJS_BOOKING_TEMPLATE_ID=your_booking_template_id
> REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID=your_triptailor_template_id
> REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
> ```
> Then re-run `npm run build` and upload again.

---

### Step 6 — Test Your Live Website 🎉

1. Open your browser and go to your domain (e.g. `https://yourdomain.com`)
2. Your Egypt Advisor Tours website should be live!

**Check these things work:**
- [ ] Homepage loads with the photo slideshow
- [ ] Clicking **"Tours"** in the navbar takes you to the tours page
- [ ] The **Book Now** button opens the booking form
- [ ] Page refresh on `/tours` doesn't show 404 (this is fixed by the `.htaccess` file)

---

## 🟡 OPTION C — Free Node.js Hosting with Railway (Full Functionality, No VPS Needed)

> **Yes — you can get the full website with a working Admin Panel completely free, without buying a VPS.**
> This option uses **Railway**, a free cloud platform that runs Node.js apps automatically from your GitHub repository.

> **⚠️ Important limitation to read before starting:**
> The Admin Panel saves changes to files on the server. These saved changes will be **lost on any redeployment** (triggered by code pushes, Railway configuration changes, or manual redeploys — because Railway redeploys from your GitHub code, resetting the files). For content you want to keep permanently (tours, blog posts, gallery photos), always edit the files in `client/src/data/` directly in your code editor and push to GitHub — don't rely solely on the Admin Panel to save them.

**What you get:**
- ✅ Full website visible to everyone online
- ✅ Working Admin Panel that saves changes (between sessions)
- ✅ Booking forms send emails (with EmailJS)
- ✅ No server setup, no SSH, no Linux commands
- ✅ Free tier — no credit card required to start

Railway's free tier is generous enough for this project. Check [railway.app/pricing](https://railway.app/pricing) for the latest limits.

---

### Step 1 — Sign Up for Railway

1. Go to **[railway.app](https://railway.app)**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up using your **GitHub account** (click "Login with GitHub")
4. Authorize Railway to access your GitHub account

Railway gives you a free tier with no credit card required to start — see [railway.app/pricing](https://railway.app/pricing) for current limits.

---

### Step 2 — Deploy Your Backend (Node.js Server)

1. In Railway, click **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. Select your **`egypt-advisor-tours`** repository
4. Railway will detect it's a Node.js project automatically
5. Before it deploys, click **"Configure"** → set the **Root Directory** to `server`
   - This tells Railway to run the server folder, not the whole project
6. Click **"Deploy"**
7. Wait 1–2 minutes — Railway will build and start your Node.js server
8. When it says **"Active"**, click on your deployment to see its **public URL**
   - It will look like: `https://your-project-name.up.railway.app` (Railway generates a unique URL)
   - **Copy this URL** — you'll need it in Step 4

---

### Step 3 — Deploy Your Frontend (React Website)

You have two choices for hosting the React frontend:

**Choice A — Also on Railway (easiest)**

1. In Railway, click **"New"** → **"GitHub Repo"** again
2. Select the same `egypt-advisor-tours` repository
3. Set **Root Directory** to `client`
4. Under **Settings → Build Command**, set: `npm run build`
5. Under **Settings → Start Command**, set: `npx serve -s build`
6. Click **"Deploy"**

**Choice B — On Vercel (recommended, also free)**

Follow the Vercel steps from [GO-LIVE-GUIDE.md](./GO-LIVE-GUIDE.md) to deploy the frontend separately. Vercel is the fastest option for React apps.

---

### Step 4 — Connect Frontend to Backend

Now tell the frontend where your backend API is running:

1. Create (or update) `client/.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-url.up.railway.app
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
   REACT_APP_EMAILJS_BOOKING_TEMPLATE_ID=your_booking_template_id
   REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID=your_triptailor_template_id
   REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
   ```
   *(Replace `https://your-backend-url.up.railway.app` with the actual public URL you copied in Step 2 — Railway generates a unique URL for each project)*

2. Commit and push this file to GitHub:
   ```
   git add client/.env.production
   git commit -m "Add Railway backend URL"
   git push
   ```

3. Railway will automatically redeploy with the new settings

---

### Step 5 — Set Your Custom Domain (Optional)

1. In Railway, go to your project → **Settings → Domains**
2. Click **"Generate Domain"** for a free `*.up.railway.app` URL, or
3. Click **"Custom Domain"** and enter your own domain (e.g. `egyptadvisortours.com`)
4. Update your domain's DNS A record to point to Railway's IP (shown on screen)

---

### Step 6 — Test Everything 🎉

Open your Railway URL (or custom domain) and check:

- [ ] Homepage loads with the photo slideshow
- [ ] Tours, Blogs, and Contact pages work
- [ ] Scroll to footer → click **Admin Panel** → tours and blogs load
- [ ] In Admin Panel, edit a tour name and click Save → refresh the page → the change appears
- [ ] Book Now button → fill the form → you receive an email

---

## 🔵 OPTION B — VPS/Cloud Hosting (Full Functionality with Admin Panel)

> Use this if you have Hostinger's **VPS or Cloud** plan.
> This gives you the full website including a working Admin Panel that saves changes.

### Step 1 — Choose an Operating System for Your VPS

When you first set up a Hostinger VPS you are shown a screen that says:

> *"Choose OS, control panel, or application that you want to install. You can change this later through VPS dashboard."*

You will see three tabs: **OS**, **Control Panel**, and **Application**.

**➡️ Click the "OS" tab** (not "Control Panel" or "Application").

You will then see this list of operating systems to choose from:

| OS | Should you pick it? | Why |
|---|---|---|
| **Ubuntu** | ✅ **YES — pick this one** | Best for beginners. All commands in this guide are written for Ubuntu. Huge community and excellent Node.js support. |
| AlmaLinux | ❌ No | Enterprise-focused. Fewer beginner guides available. |
| Debian | ⚠️ Advanced | Similar to Ubuntu but fewer beginner resources. The commands in this guide will still work, but some steps may differ slightly. |
| Rocky Linux | ❌ No | Enterprise-focused, minimal beginner support. |
| Alpine Linux | ❌ No | Minimal/advanced OS, not beginner-friendly. Many standard tools are missing by default. |
| Arch Linux | ❌ No | Requires advanced Linux knowledge to set up. |
| CentOS | ❌ No | CentOS 7 reached end-of-life in 2024. CentOS Stream is a rolling preview, not a stable server OS. Either way, not recommended for beginners. |
| CloudLinux | ❌ No | Designed for shared hosting companies, not for individual websites. |
| Fedora Cloud | ❌ No | Short release cycle — needs frequent reinstalls. |
| Kali Linux | ❌ No | A security/hacking research OS — not for hosting websites. |
| openSUSE | ❌ No | Enterprise/advanced Linux. Not beginner-friendly. |

**Exactly what to click:**

1. In **[hPanel](https://hpanel.hostinger.com)**, go to **VPS** in the left sidebar and click your VPS plan
2. Click **"Set Up"** or **"Manage"** → then **"Operating System"**
3. Click the **OS** tab
4. Click **Ubuntu**
5. From the version dropdown (if shown), select **Ubuntu 22.04 LTS**
   - "LTS" means Long-Term Support — 5 years of security updates
   - If 22.04 isn't listed, pick the newest version with "LTS" in the name
6. Leave **Control Panel** as **"No control panel"** — you don't need one
7. Click **"Set Up"** or **"Continue"** to confirm

> **⚠️ Don't choose a control panel or application** (like cPanel, Plesk, or WordPress) — those are for different types of websites. This project runs on Node.js and doesn't need them. You can always change the OS later from the VPS dashboard if needed.

After confirming, Hostinger will take 1–5 minutes to create your VPS. You will receive an email containing:
- Your VPS **IP address** (e.g. `123.45.67.89`)
- Your **root password**

Keep these safe — you'll need them in the next step.

---

### Step 2 — Connect to Your VPS via SSH

1. In hPanel, find your **VPS details** — you'll need the IP address, username (`root`), and password
2. **On Windows:** Download and install **PuTTY** (free): [putty.org](https://putty.org)
   - Open PuTTY → enter your VPS IP address → click **Open** → log in as `root`
3. **On Mac/Linux:** Open Terminal and run:
   ```
   ssh root@YOUR_VPS_IP_ADDRESS
   ```
   Enter your password when prompted

---

### Step 3 — Install Node.js on Your VPS

Once connected via SSH, run these commands one by one (copy and paste each line, then press Enter):

```bash
# Update system packages
apt update && apt upgrade -y

# Install Node.js 18 (LTS version)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

You should see version numbers printed — that means Node.js is installed! ✅

---

### Step 4 — Install Git and Clone Your Website

```bash
# Install git
apt-get install -y git

# Go to the web folder
cd /var/www

# Clone your website (replace with your GitHub repository URL)
git clone https://github.com/jozoxm/egypt-advisor-tours.git

# Go into the project folder
cd egypt-advisor-tours
```

---

### Step 5 — Install Dependencies

```bash
# Install all packages for the project
npm install
npm install --prefix client
npm install --prefix server
```

This downloads all the code libraries the website needs. It may take 2–3 minutes.

---

### Step 6 — Set Up Environment Variables

```bash
# Create the production environment file for the React app
nano client/.env.production
```

Paste this content (replace with your real EmailJS values):
```
REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
REACT_APP_EMAILJS_BOOKING_TEMPLATE_ID=your_booking_template_id
REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID=your_triptailor_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
REACT_APP_API_URL=https://yourdomain.com
```

Press `Ctrl+O` then Enter to save, then `Ctrl+X` to exit.

---

### Step 7 — Build the React Frontend

```bash
npm run build
```

Wait for **"Compiled successfully!"** — this creates the `client/build` folder.

---

### Step 8 — Install PM2 (Keeps Your Server Running 24/7)

```bash
# Install PM2 globally
npm install -g pm2

# Start your Node.js server with PM2
pm2 start server/index.js --name "egypt-advisor-tours"

# Make it start automatically when the VPS reboots
pm2 startup
pm2 save
```

Check it's running:
```bash
pm2 status
```

You should see `egypt-advisor-tours` with status **online** ✅

---

### Step 9 — Install and Configure Nginx (Web Server)

Nginx serves your website files and forwards API requests to your Node.js server.

```bash
# Install Nginx
apt-get install -y nginx

# Create a configuration file for your website
nano /etc/nginx/sites-available/egypt-advisor-tours
```

Paste this configuration (replace `yourdomain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve the React frontend
    root /var/www/egypt-advisor-tours/client/build;
    index index.html;

    # Handle React Router - all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Forward API requests to Node.js server
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Press `Ctrl+O` then Enter to save, then `Ctrl+X` to exit.

```bash
# Enable the site
ln -s /etc/nginx/sites-available/egypt-advisor-tours /etc/nginx/sites-enabled/

# Test the configuration is correct
nginx -t

# Start Nginx
systemctl restart nginx
systemctl enable nginx
```

---

### Step 10 — Set Up SSL (HTTPS) — Free with Let's Encrypt

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get your free SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts — enter your email and agree to the terms. Certbot automatically configures HTTPS.

---

### Step 11 — Point Your Domain to Your VPS

1. Log in to **hPanel → Domains**
2. Find your domain → click **Manage**
3. Go to **DNS / Nameservers**
4. Update the **A records**:
   - `@` (root domain) → your VPS IP address
   - `www` → your VPS IP address
5. DNS changes can take up to 24 hours to propagate

---

### Step 12 — Test Your Full Website 🎉

Go to `https://yourdomain.com` in your browser and check:

- [ ] Homepage loads with the photo slideshow
- [ ] Tours, Blogs, and Contact pages work
- [ ] Book Now button sends an email to your inbox
- [ ] Scroll to the footer → click **Admin Panel** → you can log in and save changes
- [ ] Refreshing any page (`/tours`, `/contact`, etc.) works without 404

---

## 👁️ How to Preview and Test Your Website Live

### Option 1 — Test on Your Computer First (Before Uploading)

This is the safest way to check changes before anyone sees them.

**Terminal/Command Prompt:**
```bash
# In one terminal — start the backend server
npm run start:server

# In another terminal — start the frontend
npm run start:client
```

Then open your browser and go to: **[http://localhost:3000](http://localhost:3000)**

You'll see your website live on your own computer. Any change you save will instantly appear in the browser.

---

### Option 2 — Hostinger's Built-in Preview (Shared Hosting)

Hostinger gives you a **temporary preview URL** before you connect your domain:

1. In hPanel, go to **Hosting → Manage**
2. Look for **"Preview"** or **"Temporary URL"** in the dashboard
3. It will look like: `https://youraccount.hostinger-server.com`
4. Use this URL to test your uploaded website before pointing your real domain to it

---

### Option 3 — Staging Subdomain (VPS)

Create a separate staging environment to test before going live:

```bash
# In Nginx config, create a subdomain for testing
nano /etc/nginx/sites-available/staging
```

```nginx
server {
    listen 80;
    server_name staging.yourdomain.com;
    root /var/www/egypt-advisor-tours-staging/client/build;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Point `staging.yourdomain.com` DNS A record to your VPS IP, and use this URL for testing changes before deploying to the main domain.

---

### Option 4 — Share a Preview Link with Others (Using ngrok)

While running the site on your own computer, you can share a public link with anyone using **ngrok** (free):

1. Download ngrok from [ngrok.com](https://ngrok.com) — sign up for a free account
2. Run your website locally first (see Option 1 above)
3. In a new terminal, run:
   ```
   ngrok http 3000
   ```
4. ngrok gives you a URL like `https://abc123.ngrok.io` — share this link with anyone!
5. They can view and interact with your website in real time

---

## 🔄 How to Update Your Website After Changes

### For Shared Hosting (Option A):

1. Make your changes on your computer
2. Run `npm run build` again in the `egypt-advisor-tours` folder
3. Upload the new contents of `client/build` to `public_html` (overwrite existing files)
4. Refresh your browser — changes are live!

### For VPS Hosting (Option B):

```bash
# Connect to your VPS via SSH, then:
cd /var/www/egypt-advisor-tours

# Download latest changes
git pull origin main

# Rebuild the frontend
npm run build

# Restart the server
pm2 restart egypt-advisor-tours

echo "✅ Website updated!"
```

---

## 🔍 Troubleshooting

### ❌ "404 Not Found" when visiting pages like `/tours`

- **Shared Hosting:** Make sure the `.htaccess` file from Step 2 is in your `public_html` folder
- **VPS:** Make sure your Nginx config has `try_files $uri $uri/ /index.html;`

### ❌ Website shows a blank white page

- Open your browser's **DevTools** (press `F12`) → go to **Console** tab → look for red error messages
- Make sure you uploaded the files from `client/build`, not from `client/src`

### ❌ Build fails with errors

Make sure Node.js is installed:
```bash
node --version   # Should show v14 or higher
npm --version
```

If you get `npm ERR!` errors, try:
```bash
npm install
npm run build
```

### ❌ Booking form doesn't send emails

- Check that you created `client/.env.production` with your real EmailJS values
- Make sure you re-ran `npm run build` after creating the `.env.production` file
- Check your **EmailJS dashboard → Email Logs** for error messages

### ❌ Admin Panel won't save changes (Shared Hosting)

Admin Panel saving requires the Node.js backend — this only works with **Option B (VPS)** or **Option C (Railway)**. On shared hosting, the Admin Panel is read-only. To edit content on shared hosting, edit the data files directly in `client/src/data/` and rebuild.

### ❌ Railway deployment fails or shows "Build failed"

1. Go to **[railway.app](https://railway.app)** → your project → click the failed deployment
2. Read the build logs — look for the error message in red
3. Most common fix: make sure the **Root Directory** is set to `server` (not the root of the project)
4. Check that `server/package.json` exists and has a `"start": "node index.js"` script

### ❌ PM2 shows server as "errored" (VPS)

Check the server logs:
```bash
pm2 logs egypt-advisor-tours
```

Common fix — check the port isn't already in use:
```bash
pm2 delete egypt-advisor-tours
pm2 start server/index.js --name "egypt-advisor-tours"
```

### ❌ Website shows blank page / "Not Found" after deploying via Hostinger hPanel Node.js

If you are using **Hostinger's built-in Node.js app** (the Node.js feature available in hPanel on shared/business plans — not a VPS), the site starts but the frontend may not appear because the React app has not been built yet.

**Automatic fix (recommended):** The project's `postinstall` script builds the React app automatically whenever `npm install` is run in a non-development environment. To trigger it:

1. In hPanel, open your **Node.js app** settings
2. Make sure `NODE_ENV` is **not** set to `development` (leave it blank or set to `production`)
3. Click **Restart** (or **Stop → Start**) — Hostinger re-runs `npm install` on restart, which triggers the build

> ⏳ The first restart after a fresh deployment will take **2–4 extra minutes** because it builds the React app. Subsequent restarts that still have the `client/build` directory present are instant (the build step is skipped). Note: if Hostinger ever wipes the build directory (e.g., a full re-deploy from Git), the build will run again on the next restart.

**Manual fix:** If you prefer to skip the automatic build, SSH into your server (or use Hostinger's Terminal) and run:
```bash
cd /path/to/egypt-advisor-tours
npm run build
```
Then restart the Node.js app in hPanel.

---

## 📞 Quick Reference — Useful Commands

| Task | Command |
|---|---|
| Build the website | `npm run build` |
| Start locally (both frontend + backend) | `npm run start:client` and `npm run start:server` |
| Check VPS server status | `pm2 status` |
| View VPS server logs | `pm2 logs egypt-advisor-tours` |
| Restart VPS server | `pm2 restart egypt-advisor-tours` |
| Update website on VPS | `git pull && npm run build && pm2 restart egypt-advisor-tours` |

---

## ✅ Deployment Checklist

Before going live, make sure you've done these:

- [ ] Replaced placeholder contact info in `client/src/data/contact-info.js`
- [ ] Added real social media links in `client/src/data/contact-info.js`
- [ ] Created `client/.env.production` with your EmailJS keys
- [ ] Built the website with `npm run build`
- [ ] Uploaded files to Hostinger (or set up VPS)
- [ ] Tested booking form — received email in inbox
- [ ] Tested `/tours` page refresh — no 404 error
- [ ] SSL certificate active (HTTPS padlock shows in browser)

---

*Need more help with EmailJS setup? See [GO-LIVE-GUIDE.md](./GO-LIVE-GUIDE.md) for detailed email configuration steps.*
