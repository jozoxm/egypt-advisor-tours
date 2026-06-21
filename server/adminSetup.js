// server/adminSetup.js
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const uploadFeature = require('@adminjs/upload');

// MUST register the adapter before creating the AdminJS instance
AdminJS.registerAdapter(AdminJSMongoose);

const tours = require('./data/tours.json');
function setupAdmin(app) {
  const adminOptions = {
    resources: [
      {
        resource: tours,
        options: {
          properties: {
            description: { type: 'richtext' }, // Creates a text editor
            photoUrl: { isVisible: { list: true, show: true, edit: false } }
          }
        },
        features: [
          uploadFeature({
            provider: { local: { bucket: 'public/uploads' } },
            properties: {
              key: 'photoUrl', // The database field for the photo
              file: 'uploadFile',
            },
            validation: { mimeTypes: ['image/png', 'image/jpeg', 'image/jpg'] },
          })
        ]
      }
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

module.exports = setupAdmin;