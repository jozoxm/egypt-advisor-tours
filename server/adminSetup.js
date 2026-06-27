const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const uploadFeature = require('@adminjs/upload');

// 1. Database Model Imports

// 2. Static Content Data Imports
const toursData = require('./data/tours.json');
const blogsData = require('./data/blogs.json');
const bookingsData = require('./data/bookings.json');
const contactData = require('./data/contact.json');
const destinationsData = require('./data/destinations.json');
const galleryData = require('./data/gallery.json');
const promotionsData = require('./data/promotions.json');
const settingsData = require('./data/settings.json');
const slideshowData = require('./data/slideshow.json');

// 3. Register the adapter BEFORE creating the AdminJS instance
AdminJS.registerAdapter(AdminJSMongoose);

function setupAdmin(app) {
  // 4. Unified AdminJS Configuration Options
  const adminOptions = {
    resources: [
      // Data Views (Static JSON Records)
      { resource: toursData, options: { parent: { name: 'Tours' } } },
      { resource: blogsData, options: { parent: { name: 'Blogs' } } },
      { resource: bookingsData, options: { parent: { name: 'Bookings' } } },
      { resource: contactData, options: { parent: { name: 'Contact' } } },
      { resource: destinationsData, options: { parent: { name: 'Destinations' } } },
      { resource: galleryData, options: { parent: { name: 'Gallery' } } },
      { resource: promotionsData, options: { parent: { name: 'Promotions' } } },
      { resource: settingsData, options: { parent: { name: 'Settings' } } },
      { resource: slideshowData, options: { parent: { name: 'Homepage' } } }
    ],
    rootPath: '/admin',
    loginPath: '/admin/login',
    branding: {
      companyName: 'Egypt Advisor Tours',
      softwareBrothers: false,
    },
  };

  // 5. Initialize AdminJS Instance
  const admin = new AdminJS(adminOptions);

  // 6. Build Router and Attach to Express app
  const adminRouter = AdminJSExpress.buildRouter(admin);
  app.use(admin.options.rootPath, adminRouter);
}

// 7. Single Module Export
module.exports = setupAdmin;
