import type { CollectionConfig } from 'payload'

// ── Destinations ──────────────────────────────────────────────────────────────
// Destination guide pages for the major Egyptian cities and regions that
// Egypt Advisor Tours covers (Cairo, Luxor, Aswan, Hurghada, Sinai, etc.).
// Each destination can showcase its highlights, the tours available there,
// and practical travel info — great for SEO and customer trip research.
// The front-end can query /api/destinations to power a "Where to Go" section.
// ─────────────────────────────────────────────────────────────────────────────

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'region', 'featured', 'updatedAt'],
    description: 'Egyptian cities and regions featured on the website.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Destination Name',
      required: true,
      admin: { description: 'e.g. "Cairo", "Luxor", "Aswan"' },
    },
    {
      name: 'region',
      type: 'select',
      label: 'Region',
      options: [
        { label: 'Lower Egypt (Cairo & Delta)', value: 'lower-egypt' },
        { label: 'Upper Egypt (Luxor & Aswan)', value: 'upper-egypt' },
        { label: 'Red Sea Coast', value: 'red-sea' },
        { label: 'Sinai Peninsula', value: 'sinai' },
        { label: 'Western Desert & Oases', value: 'western-desert' },
        { label: 'Mediterranean Coast', value: 'mediterranean' },
      ],
      defaultValue: 'lower-egypt',
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Short Tagline',
      admin: { description: 'e.g. "Where ancient history meets modern life"' },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
      admin: { description: 'Full destination guide — history, culture, what to see and do.' },
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Hero Image URL',
      admin: { description: 'Main image shown on the destination card and page (external URL). Leave blank if uploading below.' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero Image (upload)',
      admin: {
        description: 'Upload a destination hero image directly. Takes precedence over Hero Image URL when both are set.',
      },
    },
    {
      name: 'highlights',
      type: 'array',
      label: 'Top Highlights',
      admin: { description: 'Key attractions or experiences in this destination.' },
      fields: [
        {
          name: 'emoji',
          type: 'text',
          label: 'Emoji Icon',
          admin: { description: 'e.g. 🏛️' },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Highlight Title',
          required: true,
          admin: { description: 'e.g. "Pyramids of Giza"' },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Short Description',
        },
      ],
    },
    {
      name: 'bestTimeToVisit',
      type: 'text',
      label: 'Best Time to Visit',
      admin: { description: 'e.g. "October – April (cooler temperatures)"' },
    },
    {
      name: 'travelTips',
      type: 'richText',
      label: 'Practical Travel Tips',
      admin: {
        description:
          'Visa info, local currency, transport tips, dress code, etc.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Destination',
      defaultValue: false,
      admin: {
        description: 'Featured destinations are shown on the homepage "Where to Go" section.',
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first.',
        position: 'sidebar',
      },
    },
  ],
}
