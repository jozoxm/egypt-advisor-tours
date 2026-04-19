import type { GlobalConfig } from 'payload'

export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  label: 'Contact Information',
  admin: {
    group: 'Settings',
    description: 'Company contact details shown throughout the website (footer, contact page, etc.).',
  },
  fields: [
    {
      name: 'companyName',
      type: 'text',
      label: 'Company Name',
    },
    {
      name: 'companyTagline',
      type: 'textarea',
      label: 'Company Tagline',
    },
    {
      name: 'emailPrimary',
      type: 'email',
      label: 'Primary Email',
    },
    {
      name: 'emailSupport',
      type: 'email',
      label: 'Support Email',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'phoneAvailability',
      type: 'text',
      label: 'Phone Availability',
      admin: { description: 'e.g. "Available 24/7"' },
    },
    {
      name: 'address',
      type: 'group',
      label: 'Address',
      fields: [
        { name: 'city', type: 'text', label: 'City' },
        { name: 'country', type: 'text', label: 'Country' },
        { name: 'fullAddress', type: 'text', label: 'Full Address' },
      ],
    },
    {
      name: 'businessHours',
      type: 'group',
      label: 'Business Hours',
      fields: [
        {
          name: 'weekdays',
          type: 'text',
          label: 'Weekdays',
          admin: { description: 'e.g. "Monday – Friday: 9 AM – 6 PM (Egypt Time)"' },
        },
        {
          name: 'weekends',
          type: 'text',
          label: 'Weekends',
          admin: { description: 'e.g. "Saturday – Sunday: 10 AM – 4 PM (Egypt Time)"' },
        },
      ],
    },
    {
      name: 'socialMedia',
      type: 'group',
      label: 'Social Media Links',
      fields: [
        { name: 'facebook', type: 'text', label: 'Facebook URL' },
        { name: 'instagram', type: 'text', label: 'Instagram URL' },
        { name: 'twitter', type: 'text', label: 'Twitter / X URL' },
        { name: 'youtube', type: 'text', label: 'YouTube URL' },
      ],
    },
  ],
}
