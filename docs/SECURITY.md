# Security

This document describes the authentication model, secret management, and security
controls implemented in this codebase.

---

## Admin Authentication

Admin access is protected by a **cookie-based session** issued by the Express server.

### Login flow

1. The operator navigates to `/admin` in the browser.  
   If no valid session cookie exists the React client renders the login form.
2. The login form POSTs `{ password }` to `POST /api/admin/login`.
3. The server derives a deterministic session token:

   ```
   HMAC-SHA256(ADMIN_SECRET, "admin-session-v1")  →  hex string
   ```

4. If the password matches `ADMIN_SECRET` the server sets an **httpOnly, Secure,
   SameSite=Strict** cookie named `admin_session` containing the token above, then
   responds `{ ok: true }`.
5. Subsequent write requests include the cookie automatically.  The
   `requireAdminAuth` middleware validates `req.cookies.admin_session` against the
   expected token on every protected endpoint.
6. `POST /api/admin/logout` clears the `admin_session` cookie and redirects to `/`.

### Development mode

When `ADMIN_SECRET` is **not** set (local development), `requireAdminAuth` passes
all requests without a cookie check so that the API is usable without credentials.

---

## Required Environment Variables

| Variable       | Required in production | Description                                                  |
|----------------|------------------------|--------------------------------------------------------------|
| `ADMIN_SECRET` | ✅ Yes                  | Strong random secret used to derive and validate the session cookie. Rotate to invalidate all existing sessions immediately. |
| `PORT`         | Optional               | HTTP port the server listens on (default: 5000).             |
| `CORS_ORIGIN`  | Optional               | Allowed CORS origin (default: `https://egyptadvisortours.com` in production, all origins in development). |
| `DATA_PATH`    | Optional               | Absolute path to the JSON data directory; must be outside the project root. Falls back to `server/data` then `/tmp`. |

Set these in `.env` locally (never commit the file) and in your host's environment
variable settings (e.g. Hostinger Node.js app → Environment Variables panel).

---

## Rate Limiting

All endpoints are protected by `express-rate-limit`:

- **Write endpoints** (POST/PUT/DELETE): 100 requests per 15 minutes per IP.
- **Read endpoints** (GET): 300 requests per 15 minutes per IP.

Exceeding the limit returns HTTP 429 with `{ "error": "Too many requests, please try again later." }`.

---

## HTTP Security Headers

`helmet` is applied globally and sets:

- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 0` (modern browsers use CSP instead)
- Content-Security-Policy (Helmet defaults)

---

## CSRF Considerations

The `admin_session` cookie is set with `SameSite=Strict`, which prevents it from
being sent on cross-site form submissions or navigations, providing strong CSRF
protection without a separate token.

---

## Secret Rotation

To invalidate all active sessions immediately, update `ADMIN_SECRET` in the server
environment and restart the process.  Because the session token is derived from the
secret via HMAC, all existing cookies become invalid instantly.

---

## Dependency Updates

Run `npm audit` (root, client, and server workspaces) regularly to check for known
vulnerabilities:

```bash
npm audit
npm audit --prefix client
npm audit --prefix server
```