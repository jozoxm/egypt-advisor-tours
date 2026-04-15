# Security Guide

## Authentication model

Admin endpoints are protected by a **JWT-based session cookie**:

1. Admin visits `/admin` — browser requests `GET /api/admin/verify`.
2. If no valid session, the login page (`AdminLogin.jsx`) is shown.
3. Admin submits username + password to `POST /api/admin/login`.
4. Server validates against `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars, then issues a **JWT** signed with `ADMIN_SECRET`.
5. The JWT is stored in an **httpOnly, SameSite=Strict cookie** — it is never accessible from JavaScript.
6. All subsequent admin API calls automatically include the cookie (via `credentials: 'include'`).
7. Session expires after **24 hours**.

### Legacy backward compat

The server also accepts the `X-Admin-Secret` header (old mechanism) so existing tooling isn't immediately broken. This should be removed once all clients have migrated to cookie auth.

---

## Secret management

| Secret | Where it lives | Purpose |
|---|---|---|
| `ADMIN_SECRET` | Server `.env` (runtime) | JWT signing key |
| `ADMIN_PASSWORD` | Server `.env` (runtime) | Admin login password |
| `ADMIN_USERNAME` | Server `.env` (runtime) | Admin login username |
| EmailJS keys | Client build env (`client/.env.production.local`) | Email sending |

**Rules:**
- **Never** commit `.env` or `client/.env.production.local` to git (both are gitignored).
- Rotate `ADMIN_SECRET` and `ADMIN_PASSWORD` if you suspect they are compromised.
- All secrets are injected at deploy time by GitHub Actions from GitHub Secrets.

---

## HTTP security headers (Helmet.js)

The server uses [Helmet](https://helmetjs.github.io/) to set secure HTTP response headers:

- `Content-Security-Policy` — restricts resource origins
- `Strict-Transport-Security` — enforces HTTPS
- `X-Frame-Options` — prevents clickjacking
- `X-Content-Type-Options` — prevents MIME sniffing
- `Referrer-Policy`

---

## Rate limiting

| Endpoint | Limit |
|---|---|
| `POST /api/admin/login` | 20 requests / 15 min per IP |
| `POST /api/bookings/customer` | 20 requests / 15 min per IP |
| All other POST endpoints | 100 requests / 15 min per IP |
| All GET endpoints | 300 requests / 15 min per IP |

---

## CSRF protection

Cookie auth uses `SameSite=Strict`, which prevents cross-site requests from including the session cookie. No separate CSRF token is required for this setup.

---

## Dependency security

Before adding any new npm package, check for known vulnerabilities:

```bash
npm audit
```

The GitHub Actions workflow also runs `npm audit` automatically.

---

## Reporting a vulnerability

Please email the maintainer directly rather than opening a public issue.
