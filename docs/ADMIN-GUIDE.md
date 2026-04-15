# Admin Guide

The admin panel is available at **https://egyptadvisortours.com/admin**.

---

## Logging in

1. Navigate to `/admin` on your site.
2. Enter your **username** and **password** (set via `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables on the server).
3. Your session lasts 24 hours via an httpOnly cookie. Log out using the **Log Out** button in the admin navbar.

---

## Managing content

Once logged in you'll see tabs across the top:

| Tab | What you can edit |
|---|---|
| **Dashboard** | Overview of your content |
| **Slideshow** | Hero homepage image slides |
| **Tours** | Tour packages (name, description, prices, itinerary, photo URL) |
| **Blogs** | Blog posts (title, content, cover image) |
| **Gallery** | Gallery images |
| **Bookings** | Customer booking records (view, update status, delete) |
| **Testimonials** | Customer testimonials |
| **Site Settings** | Hero section text & stats |
| **Contact Info** | Phone, email, address, social media links |
| **Help** | In-panel usage guide |

### Editing a tour

1. Click **Tours** tab.
2. Find the tour and click **Edit**.
3. Update any field. The `Photo URL` field controls the main tour image — paste a full URL (e.g. from Unsplash).
4. Click **Save & Update** to publish the changes immediately.

### How data is stored

Content is saved as JSON files in the `DATA_PATH` directory on the server. Changes take effect instantly without a redeploy. The data directory is backed up nightly to the `data-backup` branch via GitHub Actions.

---

## Bookings

Customer bookings are recorded in two ways:
1. **Email** — via EmailJS when the booking form is submitted.
2. **Server record** — automatically saved to the bookings list and visible in the Bookings tab.

To update a booking status: open the Bookings tab → find the booking → use the status dropdown.

---

## Logo

Place your logo file at `client/public/Gold Logo.png`.  
The logo is served from `https://egyptadvisortours.com/Gold Logo.png?v=5`.  
After replacing the file, increment the `?v=` query string everywhere that URL is referenced to bust browser caches. Known locations currently include `Navbar.jsx`, `AdminRoute.jsx`, `App.js`, and `AdminLogin.jsx`. Before finishing a logo update, run a repo-wide search for `Gold Logo.png?v=` and update every match so no stale references remain.

---

## Troubleshooting

**Changes not showing after save?**  
Hard-refresh the browser (Ctrl+Shift+R / Cmd+Shift+R) to clear the cache.

**Admin panel shows "Session expired"?**  
Log out and log in again. Sessions expire after 24 hours.

**Bookings tab empty after deploy?**  
Make sure `DATA_PATH` points to a directory outside the repo (see Deployment guide). JSON data files inside the repo are wiped on `git pull`.
