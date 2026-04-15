import type { CollectionConfig } from 'payload'

export const Tours: CollectionConfig = {
  slug: 'tours',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'duration', 'rating', 'updatedAt'],
    description: 'Tour packages shown on the Tours page.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Tour Name',
      required: true,
    },
    {
      name: 'duration',
      type: 'text',
      label: 'Duration',
      required: true,
      admin: { description: 'e.g. "4 hours" or "3 days"' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
    },
    {
      name: 'photoUrl',
      type: 'text',
      label: 'Photo URL',
      admin: { description: 'External URL to the tour hero image (leave blank if uploading below).' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Photo (upload)',
      admin: {
        description: 'Upload a tour image directly. Takes precedence over Photo URL when both are set.',
      },
    },
    {
      name: 'image',
      type: 'text',
      label: 'Emoji Icon',
      admin: { description: 'Fallback emoji, e.g. 🏛️' },
    },
    {
      name: 'rating',
      type: 'number',
      label: 'Rating (out of 5)',
      min: 0,
      max: 5,
    },
    {
      name: 'reviews',
      type: 'number',
      label: 'Number of Reviews',
    },
    {
      name: 'groupSize',
      type: 'text',
      label: 'Group Size',
      admin: { description: 'e.g. "2-10 people"' },
    },
    {
      name: 'prices',
      type: 'group',
      label: 'Prices',
      fields: [
        {
          name: 'individual',
          type: 'text',
          label: 'Individual',
          admin: { description: 'e.g. "$225"' },
        },
        {
          name: 'group',
          type: 'text',
          label: 'Group',
          admin: { description: 'e.g. "$175"' },
        },
        {
          name: 'sharing',
          type: 'text',
          label: 'Sharing',
          admin: { description: 'e.g. "$99"' },
        },
      ],
    },
    {
      name: 'itinerary',
      type: 'array',
      label: 'Itinerary',
      fields: [
        {
          name: 'day',
          type: 'number',
          label: 'Day',
          required: true,
          admin: { description: 'Use 1 for single-day tours.' },
        },
        {
          name: 'time',
          type: 'text',
          label: 'Time',
          admin: { description: 'e.g. "9:00 AM"' },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Activity Title',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Activity Description',
        },
      ],
    },
  ],
}
