// server/adminSetup.js
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const uploadFeature = require('@adminjs/upload');

// Register the Mongoose Adapter
AdminJS.registerAdapter(AdminJSMongoose);

// Import your database models (Adjust this path if your model is in a different folder)
const Tour = require('.\data\tours'); // Example path based on your file tree

const setupAdmin = (app) => {
  const adminOptions = {
    resources: [
      {
        resource: Tour,
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

  const admin = new AdminJS(adminOptions);
  
  // Build the admin route
  const adminRouter = AdminJSExpress.buildRouter(admin);
  
  // Attach it to your main Express app
  app.use(admin.options.rootPath, adminRouter);
};

module.exports = setupAdmin;