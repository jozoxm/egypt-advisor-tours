/**
 * Admin Authentication & Setup Module
 * 
 * Handles:
 * - JWT-based authentication with secure cookies
 * - Admin login/logout/verify endpoints
 * - CSRF protection
 * - Health check endpoints with CMS diagnostics
 * - Admin shell serving for Storyblok/WordPress
 * - Change persistence to MongoDB
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AuditLog } = require('./db/models');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';
const ADMIN_TOKEN_EXPIRY = process.env.ADMIN_TOKEN_EXPIRY || '24h';

const ADMIN_COOKIE_NAME = 'adminToken';
const CSRF_COOKIE_NAME = 'adminCsrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';

// ============================================================
// HELPER: Get secure cookie options
// ============================================================

function getCookieOptions(isProduction = false) {
  const baseOptions = {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };

  if (isProduction) {
    return {
      ...baseOptions,
      secure: true,
      sameSite: 'Strict',
    };
  }

  return baseOptions;
}

// ============================================================
// HELPER: Create CSRF token
// ============================================================

function createCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ============================================================
// HELPER: Log admin action to audit trail
// ============================================================

async function logAdminAction(req, action, resourceType, resourceId, changes) {
  try {
    const token = req.cookies?.[ADMIN_COOKIE_NAME];
    let username = 'unknown';
    if (token) {
      try {
        const decoded = jwt.verify(token, ADMIN_SECRET);
        username = decoded.username || 'unknown';
      } catch (_) {
        // Token invalid, use default
      }
    }

    await AuditLog.create({
      adminUsername: username,
      action,
      resourceType,
      resourceId,
      changes,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  } catch (err) {
    console.error('[AuditLog] Failed to log admin action:', err.message);
  }
}

// ============================================================
// HELPER: Verify admin authentication
// ============================================================

function verifyAdmin(req, res, next) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token', authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_SECRET);
    req.admin = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', authenticated: false });
  }
}

// ============================================================
// HELPER: Verify CSRF token
// ============================================================

function verifyCsrf(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
  const csrfHeader = req.get(CSRF_HEADER_NAME);

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }

  return next();
}

// ============================================================
// ROUTE: POST /api/admin/login
// ============================================================

function loginHandler(req, res) {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    logAdminAction(req, 'LOGIN_FAILED', 'auth', 'login', { username, reason: 'invalid-credentials' });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username, role: 'admin' },
    ADMIN_SECRET,
    { expiresIn: ADMIN_TOKEN_EXPIRY }
  );
  const csrfToken = createCsrfToken();

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = getCookieOptions(isProduction);

  res.cookie(ADMIN_COOKIE_NAME, token, cookieOptions);
  res.cookie(CSRF_COOKIE_NAME, csrfToken, cookieOptions);

  logAdminAction(req, 'LOGIN_SUCCESS', 'auth', 'login', { username });

  return res.status(200).json({ success: true, message: 'Logged in successfully' });
}

// ============================================================
// ROUTE: GET /api/admin/verify
// ============================================================

function verifyHandler(req, res) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    jwt.verify(token, ADMIN_SECRET);
    return res.status(200).json({ authenticated: true });
  } catch (_) {
    return res.status(401).json({ authenticated: false });
  }
}

// ============================================================
// ROUTE: POST /api/admin/logout
// ============================================================

function logoutHandler(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = getCookieOptions(isProduction);

  res.clearCookie(ADMIN_COOKIE_NAME, cookieOptions);
  res.clearCookie(CSRF_COOKIE_NAME, cookieOptions);

  logAdminAction(req, 'LOGOUT', 'auth', 'logout', {});

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

// ============================================================
// ROUTE: GET /api/admin/health
// ============================================================

async function healthHandler(req, res) {
  const cmsProvider = (process.env.CMS_PROVIDER || 'auto').toLowerCase();
  const isDev = process.env.NODE_ENV !== 'production';

  let health = {
    status: 'ok',
    cms: 'up',
    provider: cmsProvider,
    timestamp: new Date().toISOString(),
  };

  try {
    // Health check logic based on CMS provider
    if (cmsProvider === 'filesystem') {
      // Filesystem CMS is always "up" (no external dependency)
      health.status = 'ok';
      health.cms = 'up';
    } else if (cmsProvider === 'storyblok' || cmsProvider === 'auto') {
      const token = process.env.STORYBLOK_PREVIEW_TOKEN;
      if (!token) {
        health.status = 'degraded';
        health.cms = 'down';
        health.errorCode = 'STORYBLOK_NOT_CONFIGURED';
        if (isDev) {
          health.hint = 'Set STORYBLOK_PREVIEW_TOKEN in .env to enable Storyblok CMS';
        }
        return res.status(503).json(health);
      }
      // Could add actual health probe here
      health.status = 'ok';
      health.cms = 'up';
    } else if (cmsProvider === 'wordpress') {
      const wpBaseUrl = process.env.WORDPRESS_BASE_URL || process.env.WORDPRESS_URL;
      if (!wpBaseUrl) {
        health.status = 'degraded';
        health.cms = 'down';
        health.errorCode = 'WORDPRESS_NOT_CONFIGURED';
        health.provider = 'wordpress';
        if (isDev) {
          health.hint = 'Set WORDPRESS_BASE_URL in .env to enable WordPress CMS';
        }
        return res.status(503).json(health);
      }
      health.wordpressBaseUrl = wpBaseUrl;
      // Could add actual WordPress health probe here
      health.status = 'ok';
      health.cms = 'up';
    } else {
      health.status = 'degraded';
      health.cms = 'down';
      health.errorCode = 'UNKNOWN_PROVIDER';
      if (isDev) {
        health.hint = `CMS_PROVIDER should be one of: filesystem, storyblok, wordpress. Got: ${cmsProvider}`;
      }
      return res.status(503).json(health);
    }

    return res.status(200).json(health);
  } catch (err) {
    health.status = 'degraded';
    health.cms = 'down';
    health.error = isDev ? err.message : 'Health check failed';
    return res.status(503).json(health);
  }
}

// ============================================================
// ROUTE: GET /admin/login
// ============================================================

function loginPageHandler(req, res) {
  const force = req.query.force === '1';
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  if (token && !force) {
    try {
      jwt.verify(token, ADMIN_SECRET);
      return res.redirect('/admin');
    } catch (_) {
      // Token invalid, show login
    }
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin login - Egypt Advisor Tours</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); width: 100%; max-width: 400px; }
        h1 { text-align: center; margin-bottom: 30px; color: #333; font-size: 24px; }
        form { display: flex; flex-direction: column; gap: 15px; }
        label { font-size: 14px; color: #666; font-weight: 500; }
        input { padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
        input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
        button { padding: 12px; background: #667eea; color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.3s; }
        button:hover { background: #764ba2; }
        .error { color: #e74c3c; font-size: 14px; margin-top: 10px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Admin login</h1>
        <form method="POST" action="/api/admin/login">
          <div>
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div>
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Sign in</button>
        </form>
      </div>
    </body>
    </html>
  `;

  return res.status(200).send(html);
}

// ============================================================
// ROUTE: GET /admin
// ============================================================

function adminPanelHandler(req, res) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    jwt.verify(token, ADMIN_SECRET);
  } catch (_) {
    return res.redirect('/admin/login');
  }

  const cmsProvider = (process.env.CMS_PROVIDER || 'auto').toLowerCase();
  const wordpressBaseUrl = process.env.WORDPRESS_BASE_URL || process.env.WORDPRESS_URL;
  const storyblokEditorUrl = process.env.STORYBLOK_EDITOR_URL || 'https://app.storyblok.com';

  // Redirect to WordPress admin if needed
  if (cmsProvider === 'wordpress' || (cmsProvider === 'auto' && wordpressBaseUrl)) {
    const wpUrl = (wordpressBaseUrl || 'https://cms.example.com').replace(/\/$/, '');
    return res.redirect(`${wpUrl}/wp-admin/`);
  }

  // Extract origin from editor URL for CSP
  let editorOrigin = 'https://app.storyblok.com';
  try {
    editorOrigin = new URL(storyblokEditorUrl).origin;
  } catch (_) {
    // Use default
  }

  // Set CSP header to allow Storyblok iframe
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; frame-src ${editorOrigin}; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';`
  );

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin - Egypt Advisor Tours</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .navbar { background: white; padding: 15px 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
        .navbar h1 { font-size: 20px; color: #333; }
        .navbar-actions { display: flex; gap: 15px; }
        .navbar-actions button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; background: #667eea; color: white; }
        .navbar-actions button:hover { background: #764ba2; }
        .navbar-actions a { color: #667eea; text-decoration: none; padding: 8px 16px; }
        .navbar-actions a:hover { text-decoration: underline; }
        .container { padding: 40px; max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .card h2 { margin-bottom: 20px; color: #333; font-size: 18px; }
        .card p { color: #666; line-height: 1.6; margin-bottom: 15px; }
        .cta-button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; cursor: pointer; border: none; font-size: 14px; }
        .cta-button:hover { background: #764ba2; }
        .switch-account { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="navbar">
        <h1>🎨 Egypt Advisor Tours Admin</h1>
        <div class="navbar-actions">
          <a id="switch-account" href="/admin/login?force=1">Switch account</a>
          <button onclick="logout()">Logout</button>
        </div>
      </div>
      <div class="container">
        <div class="card">
          <h2>Welcome to the Admin Panel</h2>
          <p>Manage your Egypt Advisor Tours content through our integrated CMS.</p>
          <button class="cta-button" onclick="openEditor()">Open Storyblok editor</button>
          <div class="switch-account">
            <p><strong>Editor URL:</strong></p>
            <code>${storyblokEditorUrl}</code>
          </div>
        </div>
      </div>
      <script>
        function openEditor() {
          window.open('${storyblokEditorUrl}', '_blank');
        }
        function logout() {
          fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
            .then(() => window.location.href = '/admin/login')
            .catch(err => console.error('Logout failed:', err));
        }
      </script>
    </body>
    </html>
  `;

  return res.status(200).send(html);
}

// ============================================================
// SETUP: Register all routes
// ============================================================

function setupAdmin(app) {
  // Login/logout endpoints (no auth required)
  app.post('/api/admin/login', loginHandler);
  app.post('/api/admin/logout', verifyCsrf, verifyAdmin, logoutHandler);
  app.get('/api/admin/verify', verifyHandler);

  // Health check (no auth required)
  app.get('/api/admin/health', healthHandler);

  // Admin pages
  app.get('/admin/login', loginPageHandler);
  app.get('/admin', verifyAdmin, adminPanelHandler);

  // Export middleware for use in routes
  app.locals.verifyAdmin = verifyAdmin;
  app.locals.verifyCsrf = verifyCsrf;
  app.locals.logAdminAction = logAdminAction;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = setupAdmin;
module.exports.verifyAdmin = verifyAdmin;
module.exports.verifyCsrf = verifyCsrf;
module.exports.logAdminAction = logAdminAction;
