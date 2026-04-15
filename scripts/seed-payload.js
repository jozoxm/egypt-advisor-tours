/**
 * scripts/seed-payload.js
 *
 * One-time migration script: reads data from the existing JSON files (or
 * the JS source fallbacks) and imports them into Payload CMS via its REST API.
 *
 * Prerequisites:
 *   1. The CMS service must be running:  cd cms && npm start
 *   2. You must have created at least one admin user in Payload
 *      (visit http://localhost:3001/admin and register on first run).
 *
 * Usage:
 *   PAYLOAD_ADMIN_EMAIL=admin@example.com \
 *   PAYLOAD_ADMIN_PASSWORD=yourpassword \
 *   node scripts/seed-payload.js
 *
 * Options (environment variables):
 *   CMS_URL              — Base URL of the running CMS (default: http://localhost:3001)
 *   PAYLOAD_ADMIN_EMAIL  — Email of the Payload admin user
 *   PAYLOAD_ADMIN_PASSWORD — Password of the Payload admin user
 *   DATA_DIR             — Path to the JSON data directory (default: server/data)
 *   DRY_RUN              — Set to "1" to log what would be imported without writing
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const CMS_URL  = process.env.CMS_URL || 'http://localhost:3001';
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, '../server/data');
const DRY_RUN  = process.env.DRY_RUN === '1';

const ADMIN_EMAIL    = process.env.PAYLOAD_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD;

// ── helpers ──────────────────────────────────────────────────────────────────

async function apiFetch(pathname, options = {}) {
    const url = `${CMS_URL}${pathname}`;
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`${options.method || 'GET'} ${url} → ${res.status}: ${body}`);
    }
    return res.json();
}

async function login() {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error(
            'Set PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD before running the seed script.'
        );
    }
    const data = await apiFetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (!data.token) {
        throw new Error('Login succeeded but no token was returned. Check your Payload version or auth config.');
    }
    return data.token;
}

function readJsonFile(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.warn(`[seed] Could not parse ${filePath}:`, e.message);
        return null;
    }
}

async function createDoc(collection, doc, token) {
    if (DRY_RUN) {
        console.log(`[dry-run] Would create ${collection}:`, JSON.stringify(doc).slice(0, 120));
        return;
    }
    try {
        await apiFetch(`/api/${collection}`, {
            method: 'POST',
            headers: { Authorization: `JWT ${token}` },
            body: JSON.stringify(doc),
        });
        console.log(`[seed] Created ${collection}: ${doc.name || doc.title || doc.question || doc.customerName || '(item)'}`);
    } catch (e) {
        console.error(`[seed] Failed to create ${collection} item:`, e.message);
    }
}

async function updateGlobal(slug, data, token) {
    if (DRY_RUN) {
        console.log(`[dry-run] Would update global ${slug}:`, JSON.stringify(data).slice(0, 120));
        return;
    }
    try {
        await apiFetch(`/api/globals/${slug}`, {
            method: 'POST',
            headers: { Authorization: `JWT ${token}` },
            body: JSON.stringify(data),
        });
        console.log(`[seed] Updated global: ${slug}`);
    } catch (e) {
        console.error(`[seed] Failed to update global ${slug}:`, e.message);
    }
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log(`[seed] CMS URL:  ${CMS_URL}`);
    console.log(`[seed] Data dir: ${DATA_DIR}`);
    if (DRY_RUN) console.log('[seed] DRY RUN — no data will be written.');

    const token = await login();
    console.log('[seed] Logged in to Payload CMS.');

    // ── Tours ──────────────────────────────────────────────────────────────
    const toursFile = readJsonFile('tours.json');
    if (toursFile) {
        const tours = toursFile.tours || toursFile || [];
        console.log(`[seed] Seeding ${tours.length} tours…`);
        for (const t of tours) {
            await createDoc('tours', {
                name:       t.name,
                duration:   t.duration,
                description:t.description,
                photoUrl:   t.photoUrl || t.photo || '',
                image:      t.image || '',
                rating:     t.rating,
                reviews:    t.reviews,
                groupSize:  t.groupSize,
                prices: {
                    individual: t.prices?.individual || t.price || '',
                    group:      t.prices?.group || '',
                    sharing:    t.prices?.sharing || '',
                },
                itinerary: (t.itinerary || []).map(i => ({
                    day:         i.day || 1,
                    time:        i.time || '',
                    title:       i.title || '',
                    description: i.description || '',
                })),
            }, token);
        }

        // ── Testimonials (stored in tours.json) ───────────────────────────
        const testimonials = toursFile.testimonials || [];
        console.log(`[seed] Seeding ${testimonials.length} testimonials…`);
        for (const t of testimonials) {
            await createDoc('testimonials', {
                name:     t.name,
                location: t.location || '',
                rating:   t.rating || 5,
                comment:  t.comment || t.review || '',
                tourName: t.tourName || '',
                date:     t.date ? new Date(t.date).toISOString() : undefined,
            }, token);
        }
    } else {
        console.warn('[seed] tours.json not found — skipping tours & testimonials.');
    }

    // ── Blogs ──────────────────────────────────────────────────────────────
    const blogsFile = readJsonFile('blogs.json');
    if (blogsFile) {
        const blogs = blogsFile.blogs || blogsFile || [];
        console.log(`[seed] Seeding ${blogs.length} blogs…`);
        for (const b of blogs) {
            await createDoc('blogs', {
                title:    b.title,
                author:   b.author || 'Egypt Advisor Team',
                date:     b.date ? new Date(b.date).toISOString() : undefined,
                excerpt:  b.excerpt || b.summary || '',
                image:    b.image || '',
                category: b.category || 'Travel Tips',
                featured: Boolean(b.featured),
            }, token);
        }
    } else {
        console.warn('[seed] blogs.json not found — skipping blogs.');
    }

    // ── Gallery ────────────────────────────────────────────────────────────
    const galleryFile = readJsonFile('gallery.json');
    if (galleryFile) {
        const gallery = galleryFile.gallery || galleryFile || [];
        console.log(`[seed] Seeding ${gallery.length} gallery items…`);
        for (const g of gallery) {
            await createDoc('gallery', {
                title:      g.title,
                description:g.description || '',
                imageUrl:   g.imageUrl || g.image || '',
                category:   g.category || 'Other',
                featured:   Boolean(g.featured),
                uploadDate: g.uploadDate ? new Date(g.uploadDate).toISOString() : undefined,
            }, token);
        }
    } else {
        console.warn('[seed] gallery.json not found — skipping gallery.');
    }

    // ── Slideshow ──────────────────────────────────────────────────────────
    const slideshowFile = readJsonFile('slideshow.json');
    if (slideshowFile) {
        const slides = slideshowFile.slides || slideshowFile || [];
        console.log(`[seed] Seeding ${slides.length} slideshow items…`);
        for (const s of slides) {
            await createDoc('slideshow', {
                name:     s.name || s.title || 'Slide',
                image:    s.image || s.imageUrl || '',
                gradient: s.gradient || '',
            }, token);
        }
    } else {
        console.warn('[seed] slideshow.json not found — skipping slideshow.');
    }

    // ── Bookings ───────────────────────────────────────────────────────────
    const bookingsFile = readJsonFile('bookings.json');
    if (bookingsFile) {
        const bookings = bookingsFile.bookings || bookingsFile || [];
        console.log(`[seed] Seeding ${bookings.length} bookings…`);
        for (const b of bookings) {
            const rawDate = b.bookingDate || b.date;
            await createDoc('bookings', {
                customerName:   b.customerName || b.name || '',
                customerEmail:  b.customerEmail || b.email || '',
                customerPhone:  b.customerPhone || b.phone || '',
                tourId:         b.tourId || '',
                tourName:       b.tourName || '',
                bookingDate:    rawDate ? new Date(rawDate).toISOString() : undefined,
                numberOfPeople: b.numberOfPeople || 1,
                priceCategory:  b.priceCategory || 'individual',
                totalPrice:     String(b.totalPrice || ''),
                specialRequests:b.specialRequests || b.notes || '',
                status:         b.status || 'pending',
                source:         b.source || 'customer',
                externalId:     b.id || '',
            }, token);
        }
    } else {
        console.warn('[seed] bookings.json not found — skipping bookings.');
    }

    // ── Site Settings (global) ─────────────────────────────────────────────
    const settingsFile = readJsonFile('settings.json');
    if (settingsFile) {
        console.log('[seed] Seeding site-settings global…');
        await updateGlobal('site-settings', {
            hero: settingsFile.hero || {},
            stats: (settingsFile.stats || []).map(s => ({ value: String(s.value || ''), label: s.label || '' })),
        }, token);
    } else {
        console.warn('[seed] settings.json not found — skipping site settings.');
    }

    // ── Contact Info (global) ──────────────────────────────────────────────
    const contactFile = readJsonFile('contact.json');
    if (contactFile) {
        console.log('[seed] Seeding contact-info global…');
        await updateGlobal('contact-info', {
            companyName:        contactFile.companyName || '',
            companyTagline:     contactFile.companyTagline || '',
            emailPrimary:       contactFile.emailPrimary || '',
            emailSupport:       contactFile.emailSupport || '',
            phone:              contactFile.phone || '',
            phoneAvailability:  contactFile.phoneAvailability || '',
            address: {
                city:        contactFile.address?.city || '',
                country:     contactFile.address?.country || '',
                fullAddress: contactFile.address?.fullAddress || '',
            },
            businessHours: {
                weekdays: contactFile.businessHours?.weekdays || '',
                weekends: contactFile.businessHours?.weekends || '',
            },
            socialMedia: {
                facebook:  contactFile.socialMedia?.facebook || '',
                instagram: contactFile.socialMedia?.instagram || '',
                twitter:   contactFile.socialMedia?.twitter || '',
                youtube:   contactFile.socialMedia?.youtube || '',
            },
        }, token);
    } else {
        console.warn('[seed] contact.json not found — skipping contact info.');
    }

    // ── Promotions ─────────────────────────────────────────────────────────
    const promotionsFile = readJsonFile('promotions.json');
    if (promotionsFile) {
        const promos = promotionsFile.promotions || promotionsFile || [];
        console.log(`[seed] Seeding ${promos.length} promotions…`);
        for (const p of promos) {
            await createDoc('promotions', {
                title:       p.title || '',
                discount:    p.discount || '',
                badgeText:   p.badgeText || '🔥 Special Offer',
                imageUrl:    p.imageUrl || '',
                validFrom:   p.validFrom  ? new Date(p.validFrom).toISOString()  : undefined,
                validUntil:  p.validUntil ? new Date(p.validUntil).toISOString() : undefined,
                featured:    Boolean(p.featured),
                active:      p.active !== false,
            }, token);
        }
    } else {
        console.warn('[seed] promotions.json not found — skipping promotions.');
    }

    // ── Destinations ───────────────────────────────────────────────────────
    const destinationsFile = readJsonFile('destinations.json');
    if (destinationsFile) {
        const dests = destinationsFile.destinations || destinationsFile || [];
        console.log(`[seed] Seeding ${dests.length} destinations…`);
        for (const d of dests) {
            await createDoc('destinations', {
                name:            d.name || '',
                region:          d.region || 'lower-egypt',
                tagline:         d.tagline || '',
                imageUrl:        d.imageUrl || '',
                bestTimeToVisit: d.bestTimeToVisit || '',
                highlights:      (d.highlights || []).map(h => ({
                    emoji:       h.emoji || '',
                    title:       h.title || '',
                    description: h.description || '',
                })),
                featured: Boolean(d.featured),
                order:    d.order || 0,
            }, token);
        }
    } else {
        console.warn('[seed] destinations.json not found — skipping destinations.');
    }

    console.log('\n[seed] ✅ Seed complete!');
    if (DRY_RUN) console.log('[seed] (Dry run — nothing was actually written.)');
}

main().catch(err => {
    console.error('[seed] Fatal error:', err.message);
    process.exit(1);
});
