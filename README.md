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
- Embedded Storyblok admin shell: `http://localhost:5000/admin`

## Storyblok setup (exact UI + env steps)

The site keeps its existing API shapes (`/api/tours`, `/api/blogs`, `/api/settings`, etc.) and maps them to Storyblok stories.

1. Create or open your Storyblok space.
2. Go to **Settings → Access Tokens** and copy:
   - **Preview token** → `STORYBLOK_PREVIEW_TOKEN`
   - (Optional) **Management token** → `STORYBLOK_MANAGEMENT_TOKEN` (required for `npm run sync:storyblok`)
3. Copy your **Space ID** from Storyblok space settings → `STORYBLOK_SPACE_ID`.
4. In Storyblok, go to **Components** and create:
   - Component name: `json_document`
   - Field name: `json`
   - Field type: **Long text**
5. In Storyblok, create these stories (or override with env vars):

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

6. Configure local env values in `.env`:

```env
STORYBLOK_PREVIEW_TOKEN=<preview_token>
STORYBLOK_SPACE_ID=<space_id>
STORYBLOK_MANAGEMENT_TOKEN=<management_token>
STORYBLOK_REGION=eu
STORYBLOK_PREVIEW_SECRET=<long-random-secret>
ADMIN_SECRET=<long-random-secret>
ADMIN_PASSWORD=<secure-password>
```

- Set `STORYBLOK_REGION=us` only if your Storyblok space is in the US region.

7. Install dependencies and bootstrap Storyblok content:

```bash
npm install
npm install --prefix server
npm run sync:storyblok
```

8. In Storyblok, set preview URL to:

```text
https://your-domain.com/api/admin/preview/<STORYBLOK_PREVIEW_SECRET>
```

Local alternative:

```text
http://localhost:5000/api/admin/preview/<STORYBLOK_PREVIEW_SECRET>
```

9. Start and verify:

```bash
npm start
```

- `/admin` serves an authenticated admin shell that launches Storyblok in a new tab (with preview controls kept in-app)
- `/api/tours` and other APIs serve Storyblok-backed content
- `/api/admin/preview/<secret>` enables draft preview mode
- `/api/admin/preview/exit` clears preview mode

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
https://your-domain.com/api/admin/preview/YOUR_PREVIEW_SECRET
```

- `STORYBLOK_PREVIEW_SECRET` is optional but recommended
- The route sets a short-lived preview cookie so the API reads Storyblok draft content
- `/api/admin/preview/exit` clears the preview cookie
- `/admin` now embeds the Storyblok editor inside a protected first-party admin shell
- `/api/admin/preview/status` reports preview state for authenticated admins
- `/api/admin/preview/enable` lets the admin shell enable preview mode without exposing `STORYBLOK_PREVIEW_SECRET` in browser links

## Security note

If any Storyblok token was exposed in screenshots, chats, or public logs, rotate/regenerate it immediately in Storyblok and update your `.env`.

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
