#!/usr/bin/env node
/**
 * cleanup-orphaned-media.js
 *
 * Scans local upload directories and removes files that are no longer
 * referenced by any active content in the data store.
 *
 * Usage:
 *   node bin/cleanup-orphaned-media.js
 *
 * Cron (weekly on Sunday at midnight):
 *   0 0 * * 0 node /path/to/bin/cleanup-orphaned-media.js
 *
 * Environment:
 *   UPLOAD_ROOT - override upload root directory (default: server/public/uploads)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'server', 'data');
const DEFAULT_UPLOAD_ROOT = path.join(__dirname, '..', 'server', 'public', 'uploads');
const UPLOAD_ROOT = process.env.UPLOAD_ROOT || DEFAULT_UPLOAD_ROOT;

const SECTIONS = [
    'tours',
    'blogs',
    'gallery',
    'slideshow',
    'promotions',
    'destinations',
    'contact',
    'settings',
    'navigation',
    'footer',
    'homepage',
    'about',
    'faq',
    'tailor-trip',
];

function readJsonFile(filename, fallback) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        return fallback;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error(`[Cleanup] Failed to read ${filename}:`, err.message);
        return fallback;
    }
}

function collectActiveUrls() {
    const activeUrls = new Set();

    const walk = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) {
            for (const item of obj) {
                walk(item);
            }
            return;
        }
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (typeof value === 'string' && value.startsWith('/uploads/')) {
                activeUrls.add(value.replace(/^\/+/, ''));
            } else if (value && typeof value === 'object') {
                walk(value);
            }
        }
    };

    for (const section of SECTIONS) {
        const filename = section === 'tours' ? 'tours.json' :
                         section === 'blogs' ? 'blogs.json' :
                         section === 'gallery' ? 'gallery.json' :
                         section === 'slideshow' ? 'slideshow.json' :
                         section === 'promotions' ? 'promotions.json' :
                         section === 'destinations' ? 'destinations.json' :
                         section === 'contact' ? 'contact.json' :
                         section === 'settings' ? 'settings.json' :
                         section === 'navigation' ? 'navigation.json' :
                         section === 'footer' ? 'footer.json' :
                         section === 'homepage' ? 'homepage.json' :
                         section === 'about' ? 'about.json' :
                         section === 'faq' ? 'faq.json' :
                         section === 'tailor-trip' ? 'tailor-trip.json' :
                         null;

        if (!filename) continue;

        const fallback = {};
        if (section === 'tours') fallback.tours = [];
        else if (section === 'blogs') fallback.blogs = [];
        else if (section === 'gallery') fallback.gallery = [];
        else if (section === 'slideshow') fallback.slides = [];
        else if (section === 'promotions') fallback.promotions = [];
        else if (section === 'destinations') fallback.destinations = [];

        const data = readJsonFile(filename, fallback);
        walk(data);
    }

    const bookings = readJsonFile('bookings.json', { bookings: [] }).bookings || [];
    walk(bookings);

    return activeUrls;
}

function scanUploadDirectories() {
    const onDisk = new Map();

    if (!fs.existsSync(UPLOAD_ROOT)) {
        console.warn(`[Cleanup] Upload root does not exist: ${UPLOAD_ROOT}`);
        return onDisk;
    }

    const entries = fs.readdirSync(UPLOAD_ROOT, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const section = entry.name;
        const sectionPath = path.join(UPLOAD_ROOT, section);
        const files = fs.readdirSync(sectionPath);
        for (const file of files) {
            const relative = `${section}/${file}`;
            onDisk.set(relative, path.join(sectionPath, file));
        }
    }

    return onDisk;
}

function deleteOrphans(onDisk, activeUrls) {
    let deleted = 0;
    let failed = 0;

    for (const [relative, fullPath] of onDisk) {
        if (!activeUrls.has(relative)) {
            try {
                fs.unlinkSync(fullPath);
                console.log(`[Cleanup] Deleted orphan: ${relative}`);
                deleted++;
            } catch (err) {
                console.error(`[Cleanup] Failed to delete ${fullPath}:`, err.message);
                failed++;
            }
        }
    }

    return { deleted, failed };
}

function main() {
    console.log('[Cleanup] Starting orphaned media cleanup...');
    console.log(`[Cleanup] Upload root: ${UPLOAD_ROOT}`);

    const activeUrls = collectActiveUrls();
    console.log(`[Cleanup] Active media references found: ${activeUrls.size}`);

    const onDisk = scanUploadDirectories();
    console.log(`[Cleanup] Files on disk: ${onDisk.size}`);

    const { deleted, failed } = deleteOrphans(onDisk, activeUrls);

    console.log('[Cleanup] Summary:');
    console.log(`  - Files deleted: ${deleted}`);
    console.log(`  - Files failed: ${failed}`);
    console.log(`  - Active references: ${activeUrls.size}`);
    console.log(`  - Remaining on disk: ${onDisk.size - deleted}`);

    if (failed > 0) {
        console.warn('[Cleanup] Completed with errors. Check logs above.');
        process.exit(1);
    }

    console.log('[Cleanup] Completed successfully.');
    process.exit(0);
}

main();
