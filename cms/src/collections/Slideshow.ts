import type { CollectionConfig } from 'payload'

export const Slideshow: CollectionConfig = {
  slug: 'slideshow',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'image', 'updatedAt'],
    description: 'Hero slideshow images shown on the home page.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Slide Name',
      required: true,
      admin: { description: 'e.g. "Pyramids of Giza"' },
    },
    {
      name: 'image',
      type: 'text',
      label: 'Image URL',
      required: true,
      admin: { description: 'Full URL to the slide background image.' },
    },
    {
      name: 'gradient',
      type: 'text',
      label: 'CSS Gradient Fallback',
      admin: {
        description:
          'Shown while the image loads. e.g. "linear-gradient(135deg, #8B6914 0%, #D4AF37 100%)"',
      },
    },
  ],
}
