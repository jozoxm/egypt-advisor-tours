# Admin Guide

Content editing now happens in **Storyblok**.

## First-time Storyblok setup

1. In Storyblok, open your space and copy:
   - **Preview token** (`Settings → Access Tokens`) → `STORYBLOK_PREVIEW_TOKEN`
   - **Space ID** (space settings) → `STORYBLOK_SPACE_ID`
   - **Management token** (optional, needed for `npm run sync:storyblok`) → `STORYBLOK_MANAGEMENT_TOKEN`
2. Create component `json_document` with one field:
   - `json` (Long text)
3. Create required stories:
   - `cms-tours`, `cms-contact`, `cms-blogs`, `cms-gallery`, `cms-slideshow`, `cms-settings`, `cms-promotions`, `cms-destinations`
4. Set env values in `.env`:
   - `STORYBLOK_PREVIEW_TOKEN`, `STORYBLOK_SPACE_ID`, `STORYBLOK_REGION`, `STORYBLOK_PREVIEW_SECRET`, `ADMIN_SECRET`, `ADMIN_PASSWORD`
   - Add `STORYBLOK_MANAGEMENT_TOKEN` if using `npm run sync:storyblok`
5. Set Storyblok preview URL:
   - `https://your-domain.com/api/admin/preview/<STORYBLOK_PREVIEW_SECRET>`
   - Local: `http://localhost:5000/api/admin/preview/<STORYBLOK_PREVIEW_SECRET>`
6. Run:
   - `npm install`
   - `npm install --prefix server`
   - `npm run sync:storyblok` (optional, recommended)
   - `npm start`

If any token was exposed publicly, rotate/regenerate it in Storyblok immediately and update `.env`.

## Opening the editor

Visit:

- `https://egyptadvisortours.com/admin`

`/admin` now serves a protected in-app admin shell and embeds Storyblok in an iframe.
If `ADMIN_PASSWORD` (or legacy `ADMIN_SECRET`) is configured, unauthenticated users are redirected to `/admin/login`.

Storyblok editor URL resolution:

- `STORYBLOK_EDITOR_URL` (if provided)
- otherwise derived from `STORYBLOK_SPACE_ID` as `https://app.storyblok.com/#/me/spaces/<space-id>/content/`

## Content structure

The app expects these Storyblok stories by default:

| Content | Story slug |
|---|---|
| Tours + testimonials | `cms-tours` |
| Contact info | `cms-contact` |
| Blogs | `cms-blogs` |
| Gallery | `cms-gallery` |
| Slideshow | `cms-slideshow` |
| Site settings | `cms-settings` |
| Promotions | `cms-promotions` |
| Destinations | `cms-destinations` |

Each story should use the `json_document` component with a `json` field containing the API payload for that resource.

## Preview mode

Configure Storyblok's preview URL as:

```text
https://egyptadvisortours.com/api/admin/preview/YOUR_PREVIEW_SECRET
```

That route enables draft mode for the public site so you can preview unpublished Storyblok changes.

Admin shell preview controls:

- Enable preview via `POST /api/admin/preview/enable` (authenticated; secret not exposed to browser URL)
- Exit preview via `POST /api/admin/preview/exit` or `GET /api/admin/preview/exit`
- Preview state indicator reads `GET /api/admin/preview/status`

## Server-managed data

Bookings are still stored on the server because they contain customer submission data and are not editor-authored CMS content.
