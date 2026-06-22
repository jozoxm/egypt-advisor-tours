# Admin Guide

> **Production CMS Notice (WordPress Required 2024)**
>
> - **Production deployments _must_ use WordPress as their CMS.**
> - `CMS_PROVIDER=wordpress` must be explicitly set for all production and live environments.
> - `CMS_PROVIDER=auto`, `storyblok`, or `filesystem` are **not allowed in production** and are blocked by CI/CD.
> - Make sure all required WordPress environment variables are set (see below).
> - Storyblok instructions apply only for legacy, development, or preview purposes.

---

## First-time WordPress Setup

1. Set the following in your environment or repository secrets:
    - `CMS_PROVIDER=wordpress`
    - `WORDPRESS_BASE_URL=https://your-wordpress-site.example.com`
    - (As needed) All required slug variables or plugin configurations (see Slugs & Structure below).
2. Ensure these exact slugs or content nodes exist in your WordPress site:
    - Tours: `/tours`
    - Contact: `/contact`
    - Blogs: `/blogs`
    - Gallery: `/gallery`
    - Homepage: `/homepage`
    - About: `/about`
    - Footer: `/footer`
    - (…etc: add any others your site expects)
3. **WordPress must expose a REST API** at the expected namespace and endpoints.
4. If custom post types or plugins are required (example: ACF, custom fields), verify they are enabled and configured.
5. After update, verify with `/api/admin/health` route (requires admin login; see below).

---

## CMS Provider Policy

- In production, only WordPress is allowed as `CMS_PROVIDER`.
- `CMS_PROVIDER=auto`, `storyblok`, or `filesystem` will be blocked by deployment workflow and app server if set in production.
- For local/testing/development, you may use these modes—but remember, only WordPress serves live public content.
- For complete environment requirements, see `.env.example` and deployment scripts.

---

## WordPress Content Structure & Slugs

| Content Section         | WordPress Slug (URL path)    | Notes                         |
|------------------------ |-----------------------------|-------------------------------|
| Tours & Testimonials    | `/tours`                     | Must be a page/post           |
| Contact Info            | `/contact`                   | "                             |
| Blogs                   | `/blogs`                     | "                             |
| Gallery                 | `/gallery`                   | "                             |
| Homepage                | `/homepage`                  | "                             |
| About                   | `/about`                     | "                             |
| Footer                  | `/footer`                    | "                             |
| Navigation/Menu         | `/navigation` (if used)      | "                             |
| FAQ                     | `/faq` (if used)             | "                             |
| (etc: tailor to your config) | ...                     |                               |

- Add or change slugs as required for your project.

---

## Health Diagnostics

- Admins can check current CMS diagnostics at `/api/admin/health` (only when authenticated or in non-production).
- Shown info includes:
    - Active CMS provider
    - Effective WordPress base URL
    - Any missing or misconfigured slugs (if applicable)

---

## Legacy/Development: Storyblok

> **The following section is for legacy/development only. In production, ignore all Storyblok instructions.**

- To run local development with Storyblok, set:
  - `CMS_PROVIDER=storyblok`
  - `STORYBLOK_PREVIEW_TOKEN=...` (required)
  - `STORYBLOK_SPACE_ID=...` (optional)
  - `STORYBLOK_REGION=...` (optional)
  - `STORYBLOK_MANAGEMENT_TOKEN=...` (optional; needed for management API actions)
- Storyblok is **not allowed in production** and is blocked by CI/CD checks.
- When Storyblok is configured, the visual editor launcher is available at `/admin`.
- Preview mode endpoints:
  - Enable: `/api/admin/preview/enable`
  - Exit: `/api/admin/preview/exit`

---

## CMS Provider Configuration

**Production deployments must set:**

```env
CMS_PROVIDER=wordpress
```

Do **NOT** use `CMS_PROVIDER=auto` in production—this is only for developer convenience.

### Supported Providers

- `wordpress` (production - REQUIRED)
- `storyblok` (alternate, for preview/dev only)
- `auto` (DISALLOWED IN PRODUCTION)
- `filesystem` (usually local/test/dev only)

### Why WordPress is Required

This deployment uses WordPress as its canonical CMS for all live content. "Storyblok" or "auto" are allowed *only* in development or staging environments for manual testing.

## WordPress Content Requirements

- All content intended to be shown live MUST exist in the referenced WordPress instance.
- Each post/page must have a valid, unique slug.
- Required custom fields:
  - List all fields/plugins you need, e.g., `acf`, `seo`, etc.
  - Example slugs: `/tours`, `/about`, `/contact`
- Permalink settings: "Post name" recommended for clean URLs.

## Removing Misleading Language

> "Content editing now happens in Storyblok."  
**Delete or rephrase this** since the canonical editing system for production is now WordPress.

## Environment Variables

Required for production:
```env
CMS_PROVIDER=wordpress
WORDPRESS_BASE_URL=https://YOUR-WP-SITE
PUBLIC_SITE_URL=https://YOUR-PUBLIC-SITE
REACT_APP_SITE_URL=https://YOUR-PUBLIC-SITE
CORS_ORIGIN=https://YOUR-WEB-ORIGIN
```

## Deployment Validation

CI/CD will block deployments to the main branch with `CMS_PROVIDER=auto` or unset.

## Troubleshooting

If deploy fails or site shows a warning, check:
- `CMS_PROVIDER` is set to `wordpress`
- `WORDPRESS_BASE_URL` is present and reachable
