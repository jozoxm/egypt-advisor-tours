# Admin Guide

Content editing now happens in **Storyblok**.

## Opening the editor

Visit:

- `https://egyptadvisortours.com/admin`

The application redirects that route to the configured Storyblok space/editor URL.

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
https://egyptadvisortours.com/api/admin/preview?secret=YOUR_PREVIEW_SECRET&path=/
```

That route enables draft mode for the public site so you can preview unpublished Storyblok changes.

## Server-managed data

Bookings are still stored on the server because they contain customer submission data and are not editor-authored CMS content.
