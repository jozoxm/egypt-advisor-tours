import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'tourName', 'rating', 'date'],
    description: 'Customer reviews displayed on the home page.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Customer Name',
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      admin: { description: 'e.g. "New York, USA"' },
    },
    {
      name: 'rating',
      type: 'number',
      label: 'Rating (1–5)',
      min: 1,
      max: 5,
      required: true,
    },
    {
      name: 'comment',
      type: 'textarea',
      label: 'Review Comment',
      required: true,
    },
    {
      name: 'tourName',
      type: 'text',
      label: 'Tour Name',
    },
    {
      name: 'date',
      type: 'date',
      label: 'Review Date',
    },
  ],
}
