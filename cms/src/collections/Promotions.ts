import type { CollectionConfig } from 'payload'

// ── Promotions / Special Offers ───────────────────────────────────────────────
// Manage time-limited deals, seasonal discounts, and package upgrades.
// Each promotion can be linked to a specific tour or left general.
// The front-end can query /api/promotions to show a "Special Offers" banner or
// a dedicated deals page.
// ─────────────────────────────────────────────────────────────────────────────

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'discount', 'validFrom', 'validUntil', 'active'],
    description: 'Seasonal deals and special offers shown on the website.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Offer Title',
      required: true,
      admin: { description: 'e.g. "Summer Nile Cruise Deal"' },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Description',
      admin: { description: 'Full details of the promotion shown on the offer page.' },
    },
    {
      name: 'discount',
      type: 'text',
      label: 'Discount / Saving',
      admin: {
        description:
          'Human-readable discount label, e.g. "20% off", "Save $50", "Free airport transfer".',
      },
    },
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
      label: 'Linked Tour',
      admin: {
        description:
          'Optional. Link this promotion to a specific tour. The tour name will be displayed automatically.',
      },
    },
    {
      name: 'badgeText',
      type: 'text',
      label: 'Badge Label',
      defaultValue: '🔥 Special Offer',
      admin: { description: 'Short label shown on the card, e.g. "🔥 Special Offer", "🌙 Ramadan Deal".' },
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Image URL',
      admin: { description: 'Optional hero image for the promotion card (external URL). Leave blank if uploading below.' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Image (upload)',
      admin: {
        description: 'Upload a promotion image directly. Takes precedence over Image URL when both are set.',
      },
    },
    {
      name: 'validFrom',
      type: 'date',
      label: 'Valid From',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'validUntil',
      type: 'date',
      label: 'Valid Until',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Promotion',
      defaultValue: false,
      admin: {
        description: 'Featured promotions are shown prominently at the top of the offers section.',
        position: 'sidebar',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Active / Published',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
