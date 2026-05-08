# Egypt Advisor Tours

Full-stack tour website built with React and Express, using **WordPress (headless)** as the primary CMS hosted at `https://cms.egyptadvisortours.com`.

## Local development

Prerequisites: Node.js 18+

```bash
git clone https://github.com/jozoxm/egypt-advisor-tours.git
cd egypt-advisor-tours
cp .env.example .env
npm run setup
```

Fill in at least:

- `ADMIN_SECRET`
- `ADMIN_PASSWORD`
- `WORDPRESS_BASE_URL` (optional in dev; defaults to `https://cms.egyptadvisortours.com`)

Run the app:

```bash
npm start
```

- Site/API: `http://localhost:5000`
- React dev server: `npm run dev:client`
- Express dev server: `npm run dev:server`
- WordPress admin: `https://cms.egyptadvisortours.com/wp-admin` (or `http://localhost:5000/admin` to be redirected)

## WordPress setup (headless CMS)

The site reads editor-managed content via the WordPress REST API. WordPress runs on a subdomain (`https://cms.egyptadvisortours.com`) on Hostinger shared hosting.

### Required WordPress plugins

Install these plugins through the WordPress admin (`wp-admin → Plugins → Add New`):

| Plugin | Purpose |
|---|---|
| **Advanced Custom Fields (ACF)** | Adds structured field groups to posts, pages, and CPTs |
| **Custom Post Type UI (CPT UI)** | Registers the `tour` custom post type |
| **ACF to REST API** | Exposes ACF field values in the WP REST API response under the `acf` key |

### Content modeling

| API resource | WordPress source | REST endpoint |
|---|---|---|
| Tours + testimonials | CPT `tour` | `/wp-json/wp/v2/tour?per_page=100&_embed` |
| Blogs | WP Posts | `/wp-json/wp/v2/posts?per_page=100&_embed` |
| Site settings | Page slug `site-settings` | `/wp-json/wp/v2/pages?slug=site-settings&_embed` |
| Contact info | Page slug `contact` | `/wp-json/wp/v2/pages?slug=contact&_embed` |

Content for `settings` and `contact` is read from **ACF field groups** attached to those pages. All other resources (`gallery`, `slideshow`, `promotions`, `destinations`) fall back to the filesystem JSON files.

#### ACF field groups (recommended)

**Tour CPT** — attach to post type `tour`:

| Field name | Type | Notes |
|---|---|---|
| `name` | Text | Tour title (overrides WP title) |
| `description` | Textarea | Full description |
| `duration` | Text | e.g. `4 hours` |
| `prices` | Group | sub-fields: `individual`, `group`, `sharing` (Text) |
| `rating` | Number | e.g. `4.9` |
| `reviews` | Number | review count |
| `group_size` | Text | e.g. `2-10 people` |
| `category` | Text | e.g. `Historical` |
| `itinerary` | Repeater | sub-fields: `day`, `time`, `title`, `description` |
| `featured` | True/False | |

**Contact page** — attach to page `contact`:

| Field name | Type |
|---|---|
| `companyName` | Text |
| `emailPrimary` | Email |
| `emailSupport` | Email |
| `phone` | Text |
| `address` | Group |
| `socialMedia` | Group |

**Site settings page** — attach to page `site-settings`:

| Field name | Type |
|---|---|
| `hero` | Group (badge, title, subtitle, primaryButtonText, secondaryButtonText) |
| `stats` | Repeater (value, label) |

**Slideshow page** — attach to page `slideshow`:

| Field name | Type | Notes |
|---|---|---|
| `slides` | Repeater | sub-fields: `name` (Text), `image` (URL), `gradient` (Text) |

**Home page** — attach to page `home` (optional, for extra homepage overrides):

| Field name | Type | Notes |
|---|---|---|
| Any | — | ACF fields are returned as-is to the frontend |

**Promotions CPT** — custom post type `promotion`:

| Field name | Type | Notes |
|---|---|---|
| `title` | Text | Promotion title (overrides WP title) |
| `description` | Textarea | |
| `discount` | Text | e.g. `20% off` |
| `valid_until` | Date | |
| `image` | Text | Emoji/icon shown in UI, e.g. `🎫` |
| `active` | True/False | |

**Destinations CPT** — custom post type `destination`:

| Field name | Type | Notes |
|---|---|---|
| `name` | Text | Destination name (overrides WP title) |
| `description` | Textarea | |
| `image` | Text | Emoji/icon shown in UI |
| `photo_url` | URL | Actual photo URL used in cards |
| `featured` | True/False | |

**Gallery page** — attach to page `gallery`:

| Field name | Type | Notes |
|---|---|---|
| `gallery` | Repeater | sub-fields: `image` (URL), `caption` (Text), `alt` (Text) |

> **Note:** Bookings are submitted by customers via the public `/api/bookings/customer` endpoint and stored server-side. Admin can view and export them via `/api/bookings` (requires login). A WordPress `booking` CPT is not required but can optionally be used to mirror bookings for management in WP (requires app-password configuration).

### Required WordPress plugins

Install these in your WordPress admin — not via this repository:

| Plugin | Purpose |
|---|---|
| Advanced Custom Fields (ACF) | Custom fields on all content types |
| Custom Post Type UI | Register `tour`, `promotion`, `destination` CPTs |
| ACF to REST API | Expose ACF fields via WordPress REST API |
| Classic Editor (optional) | Simpler editing experience |

### Environment variables

```env
WORDPRESS_BASE_URL=https://cms.egyptadvisortours.com
WORDPRESS_TIMEOUT_MS=8000
WORDPRESS_HEALTH_TIMEOUT_MS=8000
WORDPRESS_CACHE_TTL_MS=300000
ADMIN_SECRET=<long-random-secret>
ADMIN_PASSWORD=<secure-password>
```

### CMS provider selection

The `CMS_PROVIDER` env var explicitly controls which CMS is used. Setting it takes precedence over auto-detection:

| Value | Behaviour |
|---|---|
| `wordpress` | Use WordPress REST API (requires `WORDPRESS_BASE_URL`) |
| `storyblok` | Use Storyblok delivery API (legacy, requires `STORYBLOK_PREVIEW_TOKEN`) |
| `filesystem` | Read from local JSON / JS source files only — no live CMS |

If `CMS_PROVIDER` is not set, the provider is **auto-detected**: WordPress if `WORDPRESS_BASE_URL` is present, Storyblok if `STORYBLOK_PREVIEW_TOKEN` is present, otherwise filesystem.

Setting `CMS_PROVIDER=filesystem` also prevents the startup script from injecting a default `WORDPRESS_BASE_URL`, so the server truly runs in offline/filesystem mode.

### Admin redirect

`GET /admin` and `GET /admin/*` redirect (302) to the WordPress admin at `WORDPRESS_BASE_URL/wp-admin`. The `/admin/login` page still provides local session authentication for protecting the bookings API.

## Storyblok (legacy)

Storyblok is still supported as a fallback CMS provider. Set `CMS_PROVIDER=storyblok` (or leave `WORDPRESS_BASE_URL` unset and set `STORYBLOK_PREVIEW_TOKEN`) to enable it. The Storyblok preview endpoints (`/api/admin/preview/*`) have been deprecated and return **410 Gone**.

## Validation

```bash
npm run test:server -- --watchAll=false --forceExit
npm run test:client -- --watchAll=false --passWithNoTests
npm run build
```
