import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
    description: 'Controls the homepage hero section text and statistics.',
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      fields: [
        {
          name: 'badge',
          type: 'text',
          label: 'Badge Text',
          admin: { description: 'e.g. "🌟 Premium Travel Experiences"' },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Main Heading',
          admin: { description: 'e.g. "Discover the Wonders of Ancient Egypt"' },
        },
        {
          name: 'subtitle',
          type: 'textarea',
          label: 'Subtitle',
        },
        {
          name: 'primaryButtonText',
          type: 'text',
          label: 'Primary Button Label',
          admin: { description: 'e.g. "Explore Tours"' },
        },
        {
          name: 'secondaryButtonText',
          type: 'text',
          label: 'Secondary Button Label',
          admin: { description: 'e.g. "Plan My Trip"' },
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Statistics (shown below the hero)',
      fields: [
        {
          name: 'value',
          type: 'text',
          label: 'Stat Value',
          admin: { description: 'e.g. "5000+"' },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Stat Label',
          admin: { description: 'e.g. "Happy Travelers"' },
        },
      ],
    },
  ],
}
