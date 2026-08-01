# Admin Guide

## Built-in Admin Panel

The application includes a built-in Admin Panel for content management. No external CMS is required.

### Access

Navigate to `/admin` and log in with the credentials configured in your `.env` file:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SECRET`

### Features

- **Content Management**: Edit tours, blogs, gallery, slideshow, promotions, destinations, contact info, homepage, about page, FAQ, and tailor-trip settings
- **Image Uploads**: Upload images with automatic WebP optimization
- **Booking Management**: View and delete customer bookings
- **Audit Logs**: Track all admin actions with timestamps, IP addresses, and user agents
- **Settings**: Manage site-wide settings

### Data Storage

All content is stored locally in JSON files under `server/data/`. To backup content, copy this directory.

### Security

- Admin sessions use JWT tokens stored in HttpOnly cookies
- CSRF protection is enforced on all state-changing requests
- Rate limiting is applied to admin endpoints
- Production environments should set `secure` cookies via `NODE_ENV=production`

### Environment Variables

Required for admin functionality:

```env
ADMIN_SECRET=<long-random-secret>
ADMIN_PASSWORD=<secure-password>
ADMIN_USERNAME=admin
```

### Health Check

Admins can verify the server is running properly:

- `GET /health` — public liveness probe
- `GET /api/admin/health` — admin health endpoint (requires authentication)

### Troubleshooting

If the admin panel is inaccessible:

1. Verify `ADMIN_SECRET`, `ADMIN_PASSWORD`, and `ADMIN_USERNAME` are set in `.env`
2. Check that the server is running and accessible
3. Ensure cookies are enabled in your browser
4. Check the server logs for authentication errors
