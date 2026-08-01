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

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024;

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter
});

function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

async function optimizeImage(filePath, originalName) {
    const ext = path.extname(filePath).toLowerCase();
    const baseName = path.basename(filePath, ext);
    const optimizedDir = path.join(UPLOAD_DIR, 'optimized');
    
    if (!fs.existsSync(optimizedDir)) {
        fs.mkdirSync(optimizedDir, { recursive: true });
    }
    
    const optimizedPath = path.join(optimizedDir, baseName + '.webp');
    
    try {
        const image = sharp(filePath);
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
            .toFile(optimizedPath);
            
        return {
            original: '/uploads/' + path.basename(filePath),
            optimized: '/uploads/optimized/' + baseName + '.webp',
            width: width,
            height: height
        };
    } catch (err) {
        console.error('Image optimization error:', err.message);
        return {
            original: '/uploads/' + path.basename(filePath),
            optimized: null,
            error: err.message
        };
    }
}

router.post('/upload', verifyAdmin, verifyCsrf, upload.single('image'), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }
    
    const result = await optimizeImage(req.file.path, req.file.originalname);
    res.json(result);
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
    dataStore.saveAll(section, req.body);
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
