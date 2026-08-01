const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function readJsonFile(filename, fallback) {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        return fallback;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error(`[DataStore] Failed to read ${filename}:`, err.message);
        return fallback;
    }
}

function writeJsonFile(filename, data) {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error(`[DataStore] Failed to write ${filename}:`, err.message);
        throw err;
    }
}

function getAll(resource) {
    switch (resource) {
        case 'tours':
            return readJsonFile('tours.json', { tours: [], testimonials: [] });
        case 'blogs':
            return readJsonFile('blogs.json', { blogs: [] });
        case 'gallery':
            return readJsonFile('gallery.json', { gallery: [] });
        case 'slideshow':
            return readJsonFile('slideshow.json', { slides: [] });
        case 'promotions':
            return readJsonFile('promotions.json', { promotions: [] });
        case 'destinations':
            return readJsonFile('destinations.json', { destinations: [] });
        case 'contact':
            return readJsonFile('contact.json', {});
        case 'settings':
            return readJsonFile('settings.json', {});
        case 'navigation':
            return readJsonFile('navigation.json', {});
        case 'footer':
            return readJsonFile('footer.json', {});
        case 'homepage':
            return readJsonFile('homepage.json', {});
        case 'about':
            return readJsonFile('about.json', {});
        case 'faq':
            return readJsonFile('faq.json', {});
        case 'tailor-trip':
            return readJsonFile('tailor-trip.json', {});
        default:
            return {};
    }
}

function saveAll(resource, data) {
    switch (resource) {
        case 'tours':
            writeJsonFile('tours.json', data);
            break;
        case 'blogs':
            writeJsonFile('blogs.json', data);
            break;
        case 'gallery':
            writeJsonFile('gallery.json', data);
            break;
        case 'slideshow':
            writeJsonFile('slideshow.json', data);
            break;
        case 'promotions':
            writeJsonFile('promotions.json', data);
            break;
        case 'destinations':
            writeJsonFile('destinations.json', data);
            break;
        case 'contact':
            writeJsonFile('contact.json', data);
            break;
        case 'settings':
            writeJsonFile('settings.json', data);
            break;
        case 'navigation':
            writeJsonFile('navigation.json', data);
            break;
        case 'footer':
            writeJsonFile('footer.json', data);
            break;
        case 'homepage':
            writeJsonFile('homepage.json', data);
            break;
        case 'about':
            writeJsonFile('about.json', data);
            break;
        case 'faq':
            writeJsonFile('faq.json', data);
            break;
        case 'tailor-trip':
            writeJsonFile('tailor-trip.json', data);
            break;
    }
}

function getBookings() {
    return readJsonFile('bookings.json', { bookings: [] }).bookings || [];
}

function saveBookings(bookings) {
    writeJsonFile('bookings.json', { bookings });
}

function getAuditLogs() {
    return readJsonFile('audit_logs.json', []).logs || [];
}

function saveAuditLogs(logs) {
    writeJsonFile('audit_logs.json', { logs });
}

module.exports = {
    getAll,
    saveAll,
    getBookings,
    saveBookings,
    getAuditLogs,
    saveAuditLogs,
};
