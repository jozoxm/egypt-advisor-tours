module.exports = {
import sharp from 'sharp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'

export default buildConfig({
  // If you'd like to use Rich Text, pass your editor here
  editor: lexicalEditor(),

  // Define and configure your collections in this array
  collections: [],

  // Your Payload secret - should be a complex and secure string, unguessable
  secret: process.env.PAYLOAD_SECRET || '',
  // Whichever Database Adapter you're using should go here
  // Mongoose is shown as an example, but you can also use Postgres
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  // If you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // This is optional - if you don't need to do these things,
  // you don't need it!
  sharp,
})
};
};const isAdmin = (req) => req && req.user && req.user.role === 'admin';

// Optional: define your webhook handler (replace URL with your real webhook if using, e.g., Zapier/Slack/CRM)
const bookingWebhook = {
  type: 'afterChange',
  hook: async ({ doc }) => {
    const fetch = require('node-fetch');
    await fetch('https://your-webhook-handler.com/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
  },
};

module.exports = {
  admin: {
    user: 'users',
  },
  collections: [
    // Users (Admins & Customers)
    {
      slug: 'users',
      auth: true,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'select', options: ['admin', 'customer'], defaultValue: 'customer', required: true },
        { name: 'phone', type: 'text' },
      ],
      access: {
        // Only users with role 'admin' can access users in admin UI
        read: isAdmin,
        update: isAdmin,
        delete: isAdmin,
        create: () => true, // Allow self-register if you want, else set: isAdmin
      },
    },
    // Tours
    {
      slug: 'tours',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'richText', required: true },
        { name: 'itinerary', label: 'Itinerary (Blocks)', type: 'blocks', blocks: [
            {
              slug: 'textSection',
              fields: [{ name: 'content', type: 'richText' }],
            },
            {
              slug: 'imageSection',
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', required: true },
                { name: 'caption', type: 'text' },
              ],
            },
          ]
        },
        { name: 'destination', type: 'relationship', relationTo: 'destinations', required: true },
        // Tour tags with emoji
        {
          name: 'tag',
          label: 'Tour Category Tag',
          type: 'select',
          options: [
            { label: "🌟 Premium", value: "premium" },
            { label: "🥇 VIP", value: "vip" },
            { label: "💸 Budget", value: "budget" },
            { label: "🔥 Special Offer", value: "special" },
          ],
          required: true,
        },
        // Special offer field
        {
          name: 'specialOffer',
          label: 'Special Offer Details',
          type: 'richText',
          required: false
        },
        // Multi-category prices
        {
          name: 'prices',
          label: 'Tour Price Categories',
          type: 'array',
          minRows: 1, maxRows: 5,
          fields: [
            { name: 'category', type: 'select', options: ['private', 'sharing', 'all inclusive'], required: true },
            { name: 'price', type: 'number', required: true },
            { name: 'notes', type: 'text' },
          ],
        },
        { name: 'duration', type: 'number', required: true, min: 1, label: 'Duration (days)' },
        { name: 'startDates', type: 'array', fields: [
            { name: 'date', type: 'date', required: true },
        ]},
        // Tour gallery (up to 15 images)
        {
          name: 'gallery',
          label: 'Tour Gallery',
          type: 'array',
          minRows: 1, maxRows: 15,
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'caption', type: 'text' },
          ]
        },
        { name: 'featured', type: 'checkbox', defaultValue: false },
        { name: 'publicGallery', type: 'relationship', relationTo: 'media', hasMany: true, label: 'Public Gallery' }, // e.g., homepage slideshow
      ],
      access: { read: () => true, update: isAdmin, create: isAdmin, delete: isAdmin },
    },
    // HOMEPAGE single document
    {
      slug: 'homepage',
      labels: { singular: 'Homepage', plural: 'Homepage' },
      admin: { disableDuplicate: true },
      access: {
        read: () => true,
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
      },
      versions: { drafts: true },
      fields: [
        { name: 'headline', type: 'text', required: true, label: 'Main Headline' },
        { name: 'intro', type: 'richText', label: 'Introductory Paragraph' },
        { name: 'slideshow', type: 'relationship', relationTo: 'slideshows', hasMany: true, label: 'Slides' },
        { name: 'promoBanner', type: 'richText', label: 'Promo Banner/Alert' },
        { name: 'seo', type: 'group', label: 'SEO', fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'text' },
        ]},
      ],
    },
    // Slideshows for homepage and public galleries
    {
      slug: 'slideshows',
      labels: { singular: 'Slide', plural: 'Slideshows' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
        { name: 'link', type: 'text', label: 'Link (URL)', required: false },
        { name: 'order', type: 'number', label: 'Order', defaultValue: 1 },
        { name: 'active', type: 'checkbox', defaultValue: true, label: 'Show in slideshow?' },
      ],
      access: {
        read: () => true,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      }
    },
    // Bookings
    {
      slug: 'bookings',
      hooks: { /* ... your hooks ... */ },
      fields: [
        { name: 'tour', type: 'relationship', relationTo: 'tours', required: true },
        { name: 'user', type: 'relationship', relationTo: 'users', required: false },
        { name: 'customerName', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'whatsApp', type: 'checkbox', label: 'Is this your WhatsApp?', defaultValue: false, required: true },
        { name: 'customerEmail', type: 'email', required: true },
        { name: 'people', type: 'number', required: true, min: 1 },
        { name: 'date', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          defaultValue: 'pending',
          required: true,
        },
        { name: 'specialRequest', type: 'textarea', label: 'Special Requests & Notes', required: false },
        { name: 'adminNotes', type: 'textarea', label: 'Internal Admin Notes', required: false },
      ],
      access: { read: isAdmin, create: () => true, update: isAdmin, delete: isAdmin },
    },

    // Destinations
    {
      slug: 'destinations',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
      access: {
        read: () => true,
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
      },
    },
    // Testimonials
    {
      slug: 'testimonials',
      fields: [
        { name: 'customerName', type: 'text', required: true },
        { name: 'message', type: 'textarea', required: true },
        { name: 'tour', type: 'relationship', relationTo: 'tours' },
        { name: 'approved', type: 'checkbox', defaultValue: false },
      ],
      access: {
        read: (req) => req?.user?.role === 'admin' ? true : { approved: true },
        update: isAdmin,
        create: () => true, // Optionally: only allow admins
        delete: isAdmin,
      },
    },
    // Media Library
    {
      slug: 'media',
      upload: {
        staticURL: '/media',
        staticDir: 'media',
        mimeTypes: ['image/*'],
      },
      fields: [],
      access: {
        read: () => true,
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
      },
    },
    // FAQs
    {
      slug: 'faqs',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'richText', required: true },
      ],
      access: {
        read: () => true,
        update: isAdmin,
        create: isAdmin,
        delete: isAdmin,
      },
    },
  ],
};