# 🚀 Deployment Guide - Hostinger Hosting

This guide provides step-by-step instructions for deploying the Egypt Advisor Tours website to Hostinger hosting.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ A Hostinger hosting account (any plan)
- ✅ Your domain name (e.g., egyptadvisortours.com)
- ✅ FTP credentials from Hostinger
- ✅ This repository cloned on your computer

---

## 🎯 Quick Overview

The deployment process involves:
1. Building the production version locally
2. Uploading files to Hostinger via FTP
3. Configuring your domain
4. Testing the live website

**Estimated Time:** 15-20 minutes

---

## 📦 Step 1: Build the Production Version

### 1.1 Install Dependencies

Open your terminal/command prompt and navigate to the client folder:

```bash
cd egypt-advisor-tours/client
npm install
```

**Wait for the installation to complete** (this may take 2-3 minutes).

### 1.2 Build the Website

Run the build command:

```bash
npm run build
```

✅ **Success!** You should see a message like:
```
Compiled successfully.
The build folder is ready to be deployed.
```

This creates a `build` folder containing all the optimized files for deployment.

---

## 🌐 Step 2: Get Your Hostinger FTP Credentials

### 2.1 Log in to Hostinger

1. Go to [https://www.hostinger.com](https://www.hostinger.com)
2. Click **"Log In"** and enter your credentials
3. Go to your **Hosting Dashboard**

### 2.2 Access FTP Details

1. In your hosting dashboard, click on **"Hosting"**
2. Select your hosting plan
3. Look for **"FTP Accounts"** or **"File Manager"**
4. Click **"FTP Accounts"** to view your credentials

You'll need:
- **FTP Host/Server:** Usually `ftp.yourdomain.com` or an IP address
- **FTP Username:** Usually your domain name or email
- **FTP Password:** The password you created (or reset if forgotten)
- **Port:** Usually `21` (or `22` for SFTP)

📝 **Note:** Write these down - you'll need them in the next step!

---

## 📤 Step 3: Upload Files to Hostinger

You have **two options** for uploading files:

### Option A: Using Hostinger File Manager (Easier - No Software Needed)

1. **Access File Manager**
   - In your Hostinger dashboard, click **"File Manager"**
   - You'll see your website's root directory

2. **Navigate to Public Directory**
   - Find the **`public_html`** folder (this is where your website files go)
   - Double-click to open it

3. **Clear Existing Files (if any)**
   - Select all existing files in `public_html`
   - Click **"Delete"** to remove them
   - ⚠️ **Important:** Only delete default/placeholder files, not any important files you've added

4. **Upload Your Build Files**
   - In your computer, navigate to `egypt-advisor-tours/client/build/`
   - Select **ALL files and folders** inside the `build` folder:
     - `index.html`
     - `asset-manifest.json`
     - `static` folder (with all its contents)
   
5. **Upload to Hostinger**
   - In the File Manager, click **"Upload"**
   - Select all the files from your `build` folder
   - Wait for upload to complete (usually 1-2 minutes)

✅ **Done!** Your files are now on the server.

---

### Option B: Using FileZilla (FTP Client)

If you prefer using an FTP client:

1. **Download FileZilla**
   - Go to [https://filezilla-project.org](https://filezilla-project.org)
   - Download and install FileZilla Client (free)

2. **Connect to Your Server**
   - Open FileZilla
   - Enter your FTP credentials:
     - **Host:** `ftp.yourdomain.com` (or IP from Hostinger)
     - **Username:** Your FTP username
     - **Password:** Your FTP password
     - **Port:** `21` (or `22` for SFTP)
   - Click **"Quickconnect"**

3. **Navigate to Public Directory**
   - In the **right panel** (Remote Site), navigate to `/public_html/`
   - In the **left panel** (Local Site), navigate to your `build` folder

4. **Upload Files**
   - Select ALL files in your local `build` folder
   - Drag them to the `/public_html/` folder on the right
   - Wait for upload to complete

5. **Verify Upload**
   - Make sure all files are uploaded:
     - `index.html`
     - `asset-manifest.json`
     - `static/` folder with all contents

✅ **Done!** Your files are now on the server.

---

## 🔧 Step 4: Configure Your Domain

### 4.1 Point Domain to Hostinger (if needed)

If you bought your domain elsewhere (GoDaddy, Namecheap, etc.):

1. Go to your domain registrar's website
2. Find **"DNS Settings"** or **"Nameservers"**
3. Update nameservers to Hostinger's:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`
   
4. Save changes
   - ⏰ **Note:** DNS propagation can take 24-48 hours

### 4.2 Set Up Domain in Hostinger

1. In Hostinger dashboard, go to **"Domains"**
2. Click **"Add Domain"** (if not already added)
3. Enter your domain name: `egyptadvisortours.com`
4. Select the hosting plan you want to use
5. Click **"Add Domain"**

### 4.3 Configure SSL Certificate (HTTPS)

**Important for Security!**

1. In Hostinger dashboard, find **"SSL"** section
2. Select your domain
3. Click **"Install SSL"** or **"Enable SSL"**
4. Choose **"Free SSL"** (Let's Encrypt)
5. Wait for installation (usually 5-10 minutes)

✅ Your website will now be accessible via `https://` (secure)

---

## 🎉 Step 5: Test Your Website

### 5.1 Access Your Website

Open your web browser and visit:
- `https://egyptadvisortours.com` (or your domain)
- Or `http://yourhostingip` if domain isn't set up yet

### 5.2 Test All Pages

Navigate through all pages to ensure they work:
- ✅ Home page
- ✅ Tours page
- ✅ Egyptian Phrases page
- ✅ Egyptian Food page
- ✅ Tailor Trip page
- ✅ About page
- ✅ Contact page

### 5.3 Test Responsiveness

Check on different devices:
- 📱 Mobile phone
- 📱 Tablet
- 💻 Desktop

### 5.4 Test Forms

- Try the newsletter subscription in the footer
- Try the contact form
- (Forms won't send emails yet - backend not connected)

---

## 🐛 Troubleshooting

### Problem: "404 Not Found" or Blank Page

**Solution:**
1. Check that `index.html` is in the root of `public_html`
2. Make sure the `static` folder is uploaded correctly
3. Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)

### Problem: "This site can't be reached"

**Solution:**
1. Check that your domain is pointing to Hostinger
2. Wait for DNS propagation (up to 48 hours)
3. Try accessing via `http://yourip` instead
4. Contact Hostinger support if issue persists

### Problem: Pages don't work when refreshing

**Solution:**
Add a `.htaccess` file to handle React Router:

1. Create a file named `.htaccess` in `public_html`
2. Add this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

3. Save and upload to `public_html`

### Problem: SSL not working

**Solution:**
1. Wait 10-15 minutes after installation
2. Force HTTPS in Hostinger settings
3. Add this to `.htaccess` (above other rules):

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Problem: Images or CSS not loading

**Solution:**
1. Check that the `static` folder is uploaded
2. Check browser console for errors (F12)
3. Make sure file permissions are correct (644 for files, 755 for folders)

---

## 🔄 Updating Your Website

When you make changes to your website:

1. **Make changes** to your code
2. **Test locally** with `npm start`
3. **Build again** with `npm run build`
4. **Upload only changed files** to `public_html`
   - Or replace all files if major changes
5. **Clear browser cache** to see changes

---

## 📞 Need Help?

### Hostinger Support
- **Live Chat:** Available 24/7 in Hostinger dashboard
- **Email:** support@hostinger.com
- **Knowledge Base:** https://support.hostinger.com

### Common Hostinger Documentation
- [How to Upload Website](https://support.hostinger.com/en/articles/1583245-how-to-upload-a-website-to-hostinger)
- [How to Point Domain](https://support.hostinger.com/en/articles/1583227-how-to-change-domain-nameservers)
- [SSL Certificate Setup](https://support.hostinger.com/en/articles/1583289-how-to-install-ssl-on-hostinger)

---

## ✅ Checklist Before Going Live

Use this checklist to ensure everything is ready:

- [ ] Production build created successfully
- [ ] All files uploaded to `public_html`
- [ ] Domain pointed to Hostinger
- [ ] SSL certificate installed and working
- [ ] All pages accessible and working
- [ ] Mobile responsiveness tested
- [ ] Forms tested (even if not sending emails)
- [ ] Browser cache cleared
- [ ] .htaccess file configured for React Router
- [ ] Contact information updated (if needed)

---

## 🎯 Next Steps After Deployment

1. **Set up Google Analytics** (optional)
   - Track website visitors
   - Understand user behavior

2. **Connect Backend** (future)
   - Set up a server for contact forms
   - Configure email sending

3. **Add Payment Gateway** (future)
   - Enable tour bookings
   - Accept payments online

4. **Regular Backups**
   - Use Hostinger's backup feature
   - Keep local copies of your code

---

## 🎊 Congratulations!

Your Egypt Advisor Tours website is now **LIVE** on Hostinger! 🏛️✨

Share your website with the world:
- **Website URL:** https://egyptadvisortours.com

---

**Last Updated:** February 2026  
**Version:** 1.0  
**Status:** Production Ready ✅
