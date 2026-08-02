const os = require('os');

let requestIdCounter = 0;

function generateRequestId() {
    requestIdCounter += 1;
    if (requestIdCounter > 999999) {
        requestIdCounter = 1;
    }
    const pid = process.pid % 1000;
    const ts = Date.now().toString(36).slice(-4);
    const seq = requestIdCounter.toString().padStart(6, '0');
    return `${pid}-${ts}-${seq}`;
}

const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL] !== undefined
    ? LOG_LEVELS[process.env.LOG_LEVEL]
    : LOG_LEVELS.warn;

function formatMessage(level, message, meta = {}) {
    const entry = {
        ts: new Date().toISOString(),
        level,
        reqId: meta.reqId || generateRequestId(),
        message,
    };
    if (meta.error) {
        entry.error = {
            message: meta.error.message,
            stack: meta.error.stack,
            code: meta.error.code,
        };
    }
    if (meta.path) entry.path = meta.path;
    if (meta.method) entry.method = meta.method;
    if (meta.status) entry.status = meta.status;
    if (meta.resource) entry.resource = meta.resource;
    if (meta.username) entry.username = meta.username;
    if (meta.ip) entry.ip = meta.ip;
    if (Object.keys(meta).length > 0 && !entry.error) {
        entry.meta = meta;
    }
    return JSON.stringify(entry);
}

function shouldLog(level) {
    return LOG_LEVELS[level] !== undefined && LOG_LEVELS[level] <= currentLevel;
}

function error(message, meta = {}) {
    if (!shouldLog('error')) return;
    if (meta.error instanceof Error) {
        meta = { ...meta, error: meta.error };
    }
    console.error(formatMessage('error', message, meta));
}

function warn(message, meta = {}) {
    if (!shouldLog('warn')) return;
    if (meta.error instanceof Error) {
        meta = { ...meta, error: meta.error };
    }
    console.warn(formatMessage('warn', message, meta));
}

function info(message, meta = {}) {
    if (!shouldLog('info')) return;
    if (meta.error instanceof Error) {
        meta = { ...meta, error: meta.error };
    }
    console.info(formatMessage('info', message, meta));
}

function debug(message, meta = {}) {
    if (!shouldLog('debug')) return;
    if (meta.error instanceof Error) {
        meta = { ...meta, error: meta.error };
    }
    console.debug(formatMessage('debug', message, meta));
}

function httpRequest(req, status, meta = {}) {
    const logMeta = {
        reqId: req && req.id ? req.id : generateRequestId(),
        method: req && req.method,
        path: req && req.path,
        status,
        ...meta,
    };
    if (status >= 500) {
        error('HTTP request failed', logMeta);
    } else if (status >= 400) {
        warn('HTTP request warning', logMeta);
    } else {
        info('HTTP request', logMeta);
    }
}

module.exports = {
    error,
    warn,
    info,
    debug,
    generateRequestId,
    httpRequest,
};
