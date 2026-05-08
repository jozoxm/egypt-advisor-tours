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

### Environment variables

```env
WORDPRESS_BASE_URL=https://cms.egyptadvisortours.com
WORDPRESS_TIMEOUT_MS=8000
WORDPRESS_CACHE_TTL_MS=300000
ADMIN_SECRET=<long-random-secret>
ADMIN_PASSWORD=<secure-password>
```

### CMS provider selection

The `CMS_PROVIDER` env var controls which CMS is used:

| Value | Behaviour |
|---|---|
| `wordpress` | Use WordPress REST API (default when `WORDPRESS_BASE_URL` is set) |
| `storyblok` | Use Storyblok delivery API (legacy) |
| `filesystem` | Read from local JSON / JS source files only |

If `CMS_PROVIDER` is not set, the provider is auto-detected from env vars.

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
