# Egypt Advisor Tours

Full-stack tour website built with React and Express, now using **Storyblok** for editor-managed content.

## Local development

Prerequisites: Node.js 18+

```bash
git clone https://github.com/jozoxm/egypt-advisor-tours.git
cd egypt-advisor-tours
cp .env.example .env
npm run setup
```

Fill in at least:

- `STORYBLOK_PREVIEW_TOKEN`
- `STORYBLOK_SPACE_ID`
- `ADMIN_SECRET`
- `ADMIN_PASSWORD`

Run the app:

```bash
npm start
```

- Site/API: `http://localhost:5000`
- React dev server: `npm run dev:client`
- Express dev server: `npm run dev:server`
- Storyblok editor redirect: `http://localhost:5000/admin`

## Storyblok setup

The site keeps its existing API shapes (`/api/tours`, `/api/blogs`, `/api/settings`, etc.) and maps them to Storyblok stories.

### Recommended Storyblok content model

1. Create a Storyblok component named `json_document`
2. Add a long-text field named `json`
3. Create these stories (or override the slugs with env vars):

| API resource | Default Storyblok slug |
|---|---|
| Tours + testimonials | `cms-tours` |
| Contact info | `cms-contact` |
| Blogs | `cms-blogs` |
| Gallery | `cms-gallery` |
| Slideshow | `cms-slideshow` |
| Site settings | `cms-settings` |
| Promotions | `cms-promotions` |
| Destinations | `cms-destinations` |

Each story stores the same JSON shape the existing API already returns. Examples:

- `cms-tours`: `{ "tours": [...], "testimonials": [...] }`
- `cms-blogs`: `{ "blogs": [...] }`
- `cms-settings`: `{ "hero": { ... }, ... }`

### Bootstrap Storyblok from the current repository data

If you have a management token, the repository can seed/update those stories for you:

```bash
npm run sync:storyblok
```

Required env vars for the sync script:

- `STORYBLOK_SPACE_ID`
- `STORYBLOK_MANAGEMENT_TOKEN`

## Preview / draft mode

Set Storyblok's preview URL to:

```text
https://your-domain.com/api/admin/preview?secret=YOUR_PREVIEW_SECRET&path=/
```

- `STORYBLOK_PREVIEW_SECRET` is optional but recommended
- The route sets a short-lived preview cookie so the API reads Storyblok draft content
- `/api/admin/preview/exit` clears the preview cookie
- `/admin` redirects to the Storyblok editor

## What changed in this migration

- Removed the local Payload CMS app and its build/start scripts
- Replaced CMS reads with Storyblok-backed server helpers
- Added Storyblok preview support and editor redirect handling
- Added a Storyblok sync script for bootstrapping stories from the existing local data

## Validation

```bash
npm run test:server -- --watchAll=false --forceExit
npm run test:client -- --watchAll=false --passWithNoTests
npm run build
```
