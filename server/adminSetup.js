// server/adminSetup.js
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const uploadFeature = require('@adminjs/upload');

// MUST register the adapter before creating the AdminJS instance
AdminJS.registerAdapter(AdminJSMongoose);

const tours = require('./data/tours.json');
const blogs = require('./data/blogs.json');
const bookings = require('./data/bookings.json');
const contact = require('./data/contact.json');
const destinations = require('./data/destinations.json');
const gallery = require('./data/gallery.json');
const promotions = require('./data/promotions.json');
const settings = require('./data/settings.json');
const slideshow = require('./data/slideshow.json');
function setupAdmin(app) {
  const adminOptions = {
    resources: [
      { resource: tours, options: { parent: { name: 'Tours' } } },
      { resource: blogs, options: { parent: { name: 'Blogs' } } },
      { resource: bookings, options: { parent: { name: 'Bookings' } } },
      { resource: contact, options: { parent: { name: 'Contact' } } },
      { resource: destinations, options: { parent: { name: 'Destinations' } } },
      { resource: gallery, options: { parent: { name: 'Gallery' } } },
      { resource: promotions, options: { parent: { name: 'Promotions' } } },
      { resource: settings, options: { parent: { name: 'Settings' } } },
      { resource: slideshow, options: { parent: { name: 'Homepage' } } }
    ],
    rootPath: '/admin',
    branding: {
      companyName: 'Egypt Advisor Tours',
      softwareBrothers: false,
    },
  };

 const admin = new AdminJS({
  // ... resources
  // Add this inside the new AdminJS({ ... }) block
  loginPath: '/admin/login',
  // Simple auth check
  allowLocalAuthentication: true,
  // Or add a simple password check
  // (In production, use a proper session/cookie strategy)
});

  // Build the admin route
const AdminJS = require('adminjs');
const AdminJSMongoose = require('@adminjs/mongoose');
const AdminJSExpress = require('@adminjs/express');

// MUST register the adapter before creating the AdminJS instance
AdminJS.registerAdapter(AdminJSMongoose); 

const Tour = require('./models/Tour'); // Ensure this path is correct!

const setupAdmin = (app) => {
  const admin = new AdminJS({
    resources: [
      {
        resource: Tour, // The actual Mongoose model
        options: { parent: { name: 'Content Management' } }
      }
    ],
    rootPath: '/admin',
  });

  const adminRouter = AdminJSExpress.buildRouter(admin);
  app.use(admin.options.rootPath, adminRouter);
};

module.exports = setupAdmin};