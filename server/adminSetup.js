const express = require('express');
const path = require('path');
const router = express.Router();

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dataStore = require('./data-store');
const bookingsRouter = require('./routes/bookings');
const logger = require('./lib/logger');

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';
const ADMIN_TOKEN_EXPIRY = process.env.ADMIN_TOKEN_EXPIRY || '24h';

const ADMIN_COOKIE_NAME = 'adminToken';
const CSRF_COOKIE_NAME = 'adminCsrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';

function getCookieOptions(isProduction = false) {
  const baseOptions = {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  };
  if (isProduction) {
    return { ...baseOptions, secure: true, sameSite: 'Strict' };
  }
  return baseOptions;
}

function getClearCookieOptions(isProduction = false) {
  if (isProduction) {
    return { secure: true, sameSite: 'Strict' };
  }
  return {};
}

function createCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function logAdminAction(req, action, resourceType, resourceId, changes) {
  try {
    const token = req.cookies?.[ADMIN_COOKIE_NAME];
    let username = 'unknown';
    if (token) {
      try {
        const decoded = jwt.verify(token, ADMIN_SECRET);
        username = decoded.username || 'unknown';
      } catch (_) {}
    }
    const logs = dataStore.getAuditLogs();
    logs.push({
      adminUsername: username,
      action,
      resourceType,
      resourceId,
      changes,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
    });
    dataStore.saveAuditLogs(logs);
  } catch (err) {
    logger.error('Failed to log admin action', { error: err, resourceType, resourceId });
  }
}

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

function loginHandler(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  // Sanitize inputs to handle accidental CRLF/whitespace from config files
  const sanitizedUsername = username.trim();
  const sanitizedPassword = password.trim();

  const loadedUsername = ADMIN_USERNAME || 'admin';
  const loadedPassword = ADMIN_PASSWORD || 'change-me';
  const usernameMatch = sanitizedUsername.toLowerCase() === loadedUsername.toLowerCase();
  const passwordMatch = sanitizedPassword === loadedPassword;

  if (process.env.ADMIN_LOGIN_DEBUG === '1') {
    console.log('[AdminLogin] Diagnostic:', {
      hasUsername: !!sanitizedUsername,
      hasPassword: !!sanitizedPassword,
      expectedUsername: loadedUsername,
      usernameMatch,
      passwordMatch,
      adminSecretLoaded: !!ADMIN_SECRET,
      nodeEnv: process.env.NODE_ENV || 'undefined',
    });
  }

  if (!usernameMatch || !passwordMatch) {
    if (process.env.ADMIN_LOGIN_DEBUG === '1') {
      const adminUsernameLen = loadedUsername ? loadedUsername.length : 0;
      const adminPasswordLen = loadedPassword ? loadedPassword.length : 0;
      logger.warn('Admin login failed attempt', {
        usernameMatch,
        passwordMatch,
        expectedUsernameLength: adminUsernameLen,
        expectedPasswordLength: adminPasswordLen,
        receivedUsernameLength: sanitizedUsername ? sanitizedUsername.length : 0,
        receivedPasswordLength: sanitizedPassword ? sanitizedPassword.length : 0,
        nodeEnv: process.env.NODE_ENV || 'undefined',
      });
    }
    logAdminAction(req, 'LOGIN_FAILED', 'auth', 'login', { username: sanitizedUsername, reason: 'invalid-credentials' });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ username, role: 'admin' }, ADMIN_SECRET, { expiresIn: ADMIN_TOKEN_EXPIRY });
  const csrfToken = createCsrfToken();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = getCookieOptions(isProduction);
  res.cookie(ADMIN_COOKIE_NAME, token, cookieOptions);
  res.cookie(CSRF_COOKIE_NAME, csrfToken, cookieOptions);
  logAdminAction(req, 'LOGIN_SUCCESS', 'auth', 'login', { username });
  return res.status(200).json({ success: true, message: 'Logged in successfully' });
}

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

function logoutHandler(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  const clearOptions = getClearCookieOptions(isProduction);
  res.clearCookie(ADMIN_COOKIE_NAME, clearOptions);
  res.clearCookie(CSRF_COOKIE_NAME, clearOptions);
  logAdminAction(req, 'LOGOUT', 'auth', 'logout', {});
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

async function healthHandler(req, res) {
  const health = { status: 'ok', timestamp: new Date().toISOString() };
  return res.status(200).json(health);
}

function loginPageHandler(req, res) {
  const force = req.query.force === '1';
  const token = req.cookies?.[ADMIN_COOKIE_NAME];
  if (token && !force) {
    try {
      jwt.verify(token, ADMIN_SECRET);
      return res.redirect('/admin');
    } catch (_) {}
  }
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
}

function adminPanelHandler(req, res) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];
  if (!token) {
    return res.redirect(302, '/admin/login');
  }
  try {
    jwt.verify(token, ADMIN_SECRET);
  } catch (_) {
    return res.redirect(302, '/admin/login');
  }
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
}

function setupAdmin(app) {
  app.post('/api/admin/login', loginHandler);
  app.post('/api/admin/logout', verifyCsrf, verifyAdmin, logoutHandler);
  app.get('/api/admin/verify', verifyHandler);
  app.get('/api/admin/health', healthHandler);
  app.get('/admin/login', loginPageHandler);
  app.get('/admin', adminPanelHandler);
  app.use('/api/bookings', bookingsRouter);
  app.locals.verifyAdmin = verifyAdmin;
  app.locals.verifyCsrf = verifyCsrf;
  app.locals.logAdminAction = logAdminAction;
}

module.exports = setupAdmin;
module.exports.verifyAdmin = verifyAdmin;
module.exports.verifyCsrf = verifyCsrf;
module.exports.logAdminAction = logAdminAction;
