const express = require('express');
const router = express.Router();
const dataStore = require('../data-store');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const adminSetup = require('../adminSetup');

const verifyAdmin = adminSetup.verifyAdmin;
const verifyCsrf = adminSetup.verifyCsrf;

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOAD_ROOT = path.join(PUBLIC_DIR, 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

const ALLOWED_EXTENSIONS = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
]);

const SECTION_FOLDERS = [
    'tours',
    'gallery',
    'slideshow',
    'promotions',
    'destinations',
    'bookings',
    'settings',
    'uploads',
];

function ensureUploadDirs() {
    if (!fs.existsSync(UPLOAD_ROOT)) {
        fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
    }
    for (const folder of SECTION_FOLDERS) {
        const dir = path.join(UPLOAD_ROOT, folder);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
}

ensureUploadDirs();

function getSectionFolder(req) {
    const section = (req.body && req.body.section) || req.query.section || 'uploads';
    const normalized = String(section).toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!SECTION_FOLDERS.includes(normalized)) {
        return 'uploads';
    }
    return normalized;
}

function validateFile(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return `Invalid file extension: ${ext || 'none'}. Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}`;
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return `Invalid MIME type: ${file.mimetype}. Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
        return `File too large: ${file.size} bytes. Max: ${MAX_FILE_SIZE} bytes (10MB)`;
    }
    return null;
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const error = validateFile(file);
    if (error) {
        return cb(new Error(error), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter,
});

function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

async function processImage(buffer, originalName, section) {
    const sectionDir = path.join(UPLOAD_ROOT, section);
    if (!fs.existsSync(sectionDir)) {
        fs.mkdirSync(sectionDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const baseName = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${baseName}-${uniqueSuffix}.webp`;
    const outputPath = path.join(sectionDir, fileName);
    const publicUrl = `/uploads/${section}/${fileName}`;

    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        let width = metadata.width;
        let height = metadata.height;

        if (width > 1200 || height > 1200) {
            if (width > height) {
                height = Math.round((height / width) * 1200);
                width = 1200;
            } else {
                width = Math.round((width / height) * 1200);
                height = 1200;
            }
        }

        await image
            .resize(width, height, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80, effort: 4 })
            .toFile(outputPath);

        return {
            original: publicUrl,
            optimized: publicUrl,
            width: width,
            height: height,
            section: section,
            filename: fileName,
        };
    } catch (err) {
        console.error('Image processing error:', err.message);
        throw new Error(`Image processing failed: ${err.message}`);
    }
}

function deleteFileByUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
        const relative = url.replace(/^\/+/, '');
        const filePath = path.join(PUBLIC_DIR, relative);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
    } catch (err) {
        console.error('Failed to delete file:', url, err.message);
    }
    return false;
}

function deleteFilesByUrls(urls) {
    if (!Array.isArray(urls)) return;
    for (const url of urls) {
        deleteFileByUrl(url);
    }
}

router.post('/upload', verifyAdmin, verifyCsrf, upload.single('image'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    const section = getSectionFolder(req);
    const result = await processImage(req.file.buffer, req.file.originalname, section);

    res.json(result);
}));

router.post('/upload-multiple', verifyAdmin, verifyCsrf, upload.array('images', 20), asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
    }

    const section = getSectionFolder(req);
    const results = [];
    const errors = [];

    for (const file of req.files) {
        try {
            const result = await processImage(file.buffer, file.originalname, section);
            results.push(result);
        } catch (err) {
            errors.push({ filename: file.originalname, error: err.message });
        }
    }

    res.json({ uploaded: results, errors });
}));

router.post('/cleanup-orphans', verifyAdmin, verifyCsrf, asyncHandler(async (req, res) => {
    const section = getSectionFolder(req);
    const sectionDir = path.join(UPLOAD_ROOT, section);

    if (!fs.existsSync(sectionDir)) {
        return res.json({ deleted: 0, message: 'Section directory does not exist' });
    }

    const files = fs.readdirSync(sectionDir);
    const data = await dataStore.getAll(section);
    const activeUrls = new Set();

    const collectUrls = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (typeof value === 'string' && value.startsWith('/uploads/')) {
                activeUrls.add(value.replace(/^\/+/, ''));
            } else if (Array.isArray(value)) {
                for (const item of value) {
                    if (typeof item === 'string' && item.startsWith('/uploads/')) {
                        activeUrls.add(item.replace(/^\/+/, ''));
                    } else if (item && typeof item === 'object') {
                        collectUrls(item);
                    }
                }
            } else if (value && typeof value === 'object') {
                collectUrls(value);
            }
        }
    };

    collectUrls(data);

    let deleted = 0;
    for (const file of files) {
        const relative = `${section}/${file}`;
        if (!activeUrls.has(relative)) {
            const filePath = path.join(sectionDir, file);
            try {
                fs.unlinkSync(filePath);
                deleted++;
            } catch (err) {
                console.error('Failed to delete orphan:', filePath, err.message);
            }
        }
    }

    res.json({ deleted, section, totalFiles: files.length });
}));

router.get('/audit', verifyAdmin, asyncHandler((req, res) => {
    const logs = dataStore.getAuditLogs();
    res.json(logs);
}));

router.get('/content/:section', verifyAdmin, asyncHandler((req, res) => {
    const section = req.params.section;
    const data = dataStore.getAll(section);
    res.json(data);
}));

router.post('/content/:section', verifyAdmin, verifyCsrf, asyncHandler((req, res) => {
    const section = req.params.section;
    const body = req.body || {};

    if (section === 'tours' && body.tours && Array.isArray(body.tours)) {
        const oldData = dataStore.getAll('tours');
        const oldTourImages = new Set();
        if (oldData.tours && Array.isArray(oldData.tours)) {
            for (const tour of oldData.tours) {
                if (tour.image) oldTourImages.add(tour.image);
                if (tour.banner) oldTourImages.add(tour.banner);
            }
        }
        const newTourImages = new Set();
        for (const tour of body.tours) {
            if (tour.image) newTourImages.add(tour.image);
            if (tour.banner) newTourImages.add(tour.banner);
        }
        for (const oldUrl of oldTourImages) {
            if (!newTourImages.has(oldUrl)) {
                deleteFileByUrl(oldUrl);
            }
        }
    }

    dataStore.saveAll(section, body);
    res.json({ success: true });
}));

router.get('/bookings', verifyAdmin, asyncHandler((req, res) => {
    res.json(dataStore.getBookings());
}));

router.delete('/bookings/:id', verifyAdmin, verifyCsrf, asyncHandler((req, res) => {
    const id = req.params.id;
    const bookings = dataStore.getBookings().filter(b => b.id !== id);
    dataStore.saveBookings(bookings);
    res.json({ success: true });
}));

router.get('/settings', verifyAdmin, asyncHandler((req, res) => {
    const settings = dataStore.getAll('settings');
    res.json(settings);
}));

router.post('/settings', verifyAdmin, verifyCsrf, asyncHandler((req, res) => {
    dataStore.saveAll('settings', req.body);
    res.json({ success: true });
}));

module.exports = router;
