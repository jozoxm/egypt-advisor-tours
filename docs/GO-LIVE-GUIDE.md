# 🚀 Go-Live Guide — Egypt Advisor Tours

Follow these **numbered steps in order**. Each step tells you exactly what to open, what to click, and what to type. No coding experience is needed for most steps.

---

## Before You Start — What You Need

| What | Where to get it |
|---|---|
| A **Vercel** account | [vercel.com](https://vercel.com) — free |
| A **GitHub** account | You already have one |
| A **Gmail** address for receiving bookings | Any Gmail account works |
| An **EmailJS** account | [emailjs.com](https://www.emailjs.com) — free (200 emails/month) |

---

## STEP 1 — Update Your Real Contact Information

> **Edit one file.** This updates the phone number, email, and address that appear on the website and in all error messages.

1. Open this file in your code editor:
   ```
   client/src/data/contact-info.js
   ```

2. Replace **every placeholder value** with your real details:

   ```js
   export const contactInfo = {
     "companyName": "Egypt Advisor Tours",
     "companyTagline": "Your trusted partner in discovering the wonders of Ancient Egypt",
     "emailPrimary": "YOUR-REAL-EMAIL@gmail.com",      // ← change this
     "emailSupport": "YOUR-REAL-EMAIL@gmail.com",      // ← change this
     "phone": "+20 XXX XXX XXXX",                      // ← change this
     "phoneAvailability": "Available 24/7",
     "address": {
       "city": "Cairo",
       "country": "Egypt",
       "fullAddress": "Your full address here"          // ← change this
     },
     ...
   };
   ```

3. Save the file.

4. Commit the change:
   ```bash
   git add client/src/data/contact-info.js
   git commit -m "Update contact info with real details"
   git push
   ```

---

## STEP 2 — Update Social Media Links

> Same file — just scroll to the `socialMedia` section and replace the `"#"` placeholders.

1. In `client/src/data/contact-info.js`, find this section:
   ```js
   "socialMedia": {
     "facebook": "#",    // ← paste your Facebook page URL
     "instagram": "#",   // ← paste your Instagram profile URL
     "twitter": "#",     // ← paste your Twitter/X profile URL
     "youtube": "#"      // ← paste your YouTube channel URL (or leave "#" if none)
   }
   ```

2. Replace each `"#"` with the full URL, for example:
   ```js
   "facebook": "https://www.facebook.com/EgyptAdvisorTours",
   "instagram": "https://www.instagram.com/egyptadvisortours",
   "twitter": "https://twitter.com/egyptadvisortours",
   "youtube": "#"
   ```

3. Save, then commit:
   ```bash
   git add client/src/data/contact-info.js
   git commit -m "Add real social media links"
   git push
   ```

---

## STEP 3 — Set Up EmailJS (So Booking & Enquiry Emails Reach You)

> EmailJS sends emails directly from the website to your inbox — no server needed.

### 3a — Create Your EmailJS Account

1. Go to **[https://www.emailjs.com](https://www.emailjs.com)**
2. Click **Sign Up** → create a free account
3. Verify your email address

### 3b — Connect Your Gmail

1. In the EmailJS dashboard, click **Email Services** (left sidebar)
2. Click **Add New Service**
3. Choose **Gmail**
4. Click **Connect Account** and sign in with the Gmail you want to receive bookings on
5. Give the service a name (e.g. `egypt_tours_gmail`)
6. Click **Create Service**
7. **Copy the Service ID** — it looks like `service_abc1234`
   > 📌 Save this — you'll need it in Step 4

### 3c — Create the Booking Confirmation Email Template

1. Click **Email Templates** (left sidebar)
2. Click **Create New Template**
3. Set the **Subject** to:
   ```
   New Booking: {{tour_name}} — {{customer_name}}
   ```
4. In the **Content / Body**, paste this (feel free to edit the wording):
   ```
   New booking received!

   Tour: {{tour_name}}
   Customer: {{customer_name}}
   Email: {{customer_email}}
   Phone: {{customer_phone}}
   Travelers: {{number_of_people}}
   Date: {{booking_date}}
   Time: {{booking_time}}
   Total: {{total_price}}

   Special Requests:
   {{special_requests}}
   ```
5. Set **To Email** to your own email address (so you receive the notification)
6. Click **Save**
7. **Copy the Template ID** — it looks like `template_xyz5678`
   > 📌 Save this — you'll need it in Step 4

### 3d — Create the Trip Tailor Enquiry Template

1. Click **Create New Template** again
2. Set the **Subject** to:
   ```
   New Trip Enquiry from {{full_name}}
   ```
3. In the **Content / Body**, paste:
   ```
   New trip tailor enquiry received!

   Name: {{full_name}}
   Email: {{email}}
   Phone: {{phone}} (WhatsApp: {{whatsapp}})

   Travel Dates: {{travel_dates}}
   Travelers: {{travelers}}
   Travel Style: {{travel_style}}
   Accommodation: {{accommodation}}
   Pace: {{pace}}
   Budget: {{budget}}

   Interests: {{interests}}
   Must-see sites: {{must_see}}
   Language: {{language}}

   Notes:
   {{notes}}
   ```
4. Set **To Email** to your own email address
5. Click **Save**
6. **Copy the Template ID** — it looks like `template_tailor9012`
   > 📌 Save this — you'll need it in Step 4

### 3e — Copy Your Public Key

1. In the EmailJS dashboard, click **Account** (top-right avatar or left sidebar)
2. Go to **API Keys**
3. **Copy the Public Key** — it looks like `AbCdEfGhIjKlMnOpQrSt`
   > 📌 Save this — you'll need it in Step 4

---

## STEP 4 — Deploy to Vercel

> Vercel hosts your website for free. It automatically rebuilds when you push to GitHub.

### 4a — Connect Your Repository to Vercel

1. Go to **[https://vercel.com](https://vercel.com)** and sign in
2. Click **Add New Project**
3. Click **Import** next to your `egypt-advisor-tours` GitHub repository
4. Vercel will auto-detect the settings from `vercel.json` — **don't change anything**
5. Before clicking **Deploy**, continue to Step 4b below ↓

### 4b — Add Your Environment Variables

> This is how the website gets your EmailJS keys securely — they are never stored in the code.

Still on the Vercel "Configure Project" screen:

1. Click **Environment Variables**
2. Add the following variables one by one:

   | Variable Name | Value (paste from Step 3) |
   |---|---|
   | `REACT_APP_EMAILJS_SERVICE_ID` | Your EmailJS Service ID (e.g. `service_abc1234`) |
   | `REACT_APP_EMAILJS_BOOKING_TEMPLATE_ID` | Your Booking Template ID (e.g. `template_xyz5678`) |
   | `REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID` | Your Trip Tailor Template ID (e.g. `template_tailor9012`) |
   | `REACT_APP_EMAILJS_PUBLIC_KEY` | Your EmailJS Public Key (e.g. `AbCdEfGhIjKlMnOpQrSt`) |

   For each variable:
   - Type the variable name in the **Name** field
   - Paste the value in the **Value** field
   - Make sure all three environments are checked: **Production**, **Preview**, **Development**
   - Click **Add**

3. After adding all 4 variables, click **Deploy**
4. Wait ~2 minutes for the build to complete
5. Vercel will give you a URL like `https://egypt-advisor-tours.vercel.app` — **this is your live website!**

### 4c — Set Up a Custom Domain (Optional but Recommended)

1. In your Vercel project dashboard, go to **Settings → Domains**
2. Type your domain name (e.g. `egyptadvisortours.com`)
3. Follow the instructions to point your domain's DNS to Vercel
4. Vercel issues a free SSL certificate automatically

---

## STEP 5 — Test Everything

After deployment, open your live URL and test:

- [ ] **Homepage loads** with the hero slideshow
- [ ] **Tours page** (`/tours`) shows all tours without 404
- [ ] **Book Now button** → fill the form → you receive an email in your Gmail inbox
- [ ] **"Tailor My Trip" button** → fill the form → you receive an email
- [ ] **Footer links** — Facebook, Instagram, Twitter open the correct pages
- [ ] **Admin Panel** — scroll to footer → click "Admin Panel" → you can edit tours, blogs, gallery

---

## STEP 6 — Update Your Tour & Blog Content

> Now that the site is live, replace the sample content with your real tours and blogs.

1. Open your live website
2. Scroll to the footer and click **🎨 Admin Panel**
3. Use the **Tours tab** to edit existing tours (name, price, description, duration)
4. Use the **Blogs tab** to add your own blog posts
5. Use the **Gallery tab** to add real photo URLs
6. Use the **Contact Info tab** to verify everything looks correct
7. Click **Save** after each section

> **Note:** The Admin Panel saves changes to the data files in your repository. After saving, you'll need to commit and push the updated data files, then Vercel will automatically redeploy.

---

## Troubleshooting

### Emails are not arriving
- Check your **EmailJS dashboard → Email Logs** to see if sends are failing
- Make sure the environment variables in Vercel match exactly what's in your EmailJS dashboard
- Check your Gmail **Spam** folder

### Page shows 404 after refreshing
- This is fixed by the `rewrites` rule already in `vercel.json` — make sure you deployed from this branch

### Tours page (`/tours`) shows 404
- Make sure you deployed from this branch which includes the `vercel.json` SPA rewrite rule

### Build fails on Vercel
- Go to Vercel dashboard → your project → **Deployments** → click the failed deployment → **Build Logs**
- Share the error in the GitHub issue

---

## Summary of Files Changed in This Branch

For reference, here's what was set up in this PR so the website could go live:

| File | What changed |
|---|---|
| `client/src/components/BookingModal.jsx` | Fixed crash bug; added EmailJS email sending |
| `client/src/App.js` | Added EmailJS email sending to Trip Tailor form |
| `client/src/data/contact-info.js` | Converted to JSON format |
| `server/index.js` | Replaced unsafe `eval()` with `JSON.parse()` |
| `vercel.json` | Added SPA rewrite so `/tours` doesn't 404 |
| `client/.env.production.example` | Documents required environment variables |
| `client/package.json` | Added `@emailjs/browser` package |
