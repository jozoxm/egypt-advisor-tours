# Egypt Advisor Tours

Full-stack tour website built with React and Express, featuring a built-in Admin Panel for content management.

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

Run the app:

```bash
npm start
```

- Site/API: `http://localhost:5000`
- React dev server: `npm run dev:client`
- Express dev server: `npm run dev:server`
- Admin Panel: `http://localhost:5000/admin`

## Admin Panel

The built-in Admin Panel provides:

- **Content Management**: Edit tours, blogs, gallery, slideshow, promotions, destinations, contact info, homepage, about page, FAQ, and tailor-trip settings
- **Image Uploads**: Upload and auto-optimize images to WebP format
- **Booking Management**: View and manage customer bookings
- **Audit Logs**: Track admin actions with IP and timestamp

Access the admin panel at `/admin` and log in with the credentials set in `.env`.

## Data Storage

Content is stored locally in JSON files under `server/data/`. This provides:

- Fast, reliable content serving without external dependencies
- Simple backup by copying the `server/data/` directory
- No database setup required

## SEO & discoverability

- Route-level SEO metadata is set dynamically in the React app for:
  - `/`, `/tours`, `/tours/:id`, `/blogs`, `/destinations`, `/special-offers`, `/about`
- Canonical, Open Graph, Twitter, and JSON-LD tags are injected per page.
- The server now serves:
  - `GET /robots.txt`
  - `GET /sitemap.xml` (includes static routes and dynamic tour detail URLs)
- Optional prerender support for crawlers:
  - Set `PRERENDER_TOKEN` (and optionally `PRERENDER_SERVICE_URL`) to enable crawler snapshots via Prerender.io-compatible services.
  - `PRERENDER_TIMEOUT_MS` controls the prerender fetch timeout before falling back to normal SPA handling.
- Recommended URL config:
  - `PUBLIC_SITE_URL` (server-side canonical/sitemap base URL)
  - `REACT_APP_SITE_URL` (client-side canonical/meta base URL)

## Validation

```bash
npm run test:server -- --watchAll=false --forceExit
npm run test:client -- --watchAll=false --passWithNoTests
npm run build
```

## Hostinger one-shot debug snapshot

The Hostinger deploy workflow now runs a post-deploy debug snapshot that logs:

- Node/process count on Hostinger (to catch accidental double app instances)
- Effective environment presence checks
- Public endpoint status + short body snippets for:
  - `/health`
  - `/api/admin/health`
  - `/api/tours`
  - `/api/navigation`
  - `/api/homepage`
  - `/api/about`
  - `/api/footer`
- Same endpoint checks from Hostinger localhost (`127.0.0.1:$PORT`, falling back to `5000`)

Use this snapshot after each redeploy to quickly separate:

- app/config issues (both public + localhost failing),
- vs. proxy/domain routing issues (public failing but localhost healthy).
