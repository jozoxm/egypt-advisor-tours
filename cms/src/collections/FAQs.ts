import type { CollectionConfig } from 'payload'

// ── Suggested new tab ──────────────────────────────────────────────────────
// FAQs (Frequently Asked Questions) — a common must-have for travel websites.
// Customers can get answers to booking, tour, and travel questions without
// contacting support.  Admins manage questions & answers through this panel
// and the front-end can fetch them via the public /api/faqs endpoint.
// ──────────────────────────────────────────────────────────────────────────

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    group: 'Content',
    defaultColumns: ['question', 'category', 'active', 'order'],
    description: 'Frequently Asked Questions displayed on the website.',
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      label: 'Question',
      required: true,
    },
    {
      name: 'answer',
      type: 'richText',
      label: 'Answer',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Booking', value: 'booking' },
        { label: 'Tours', value: 'tours' },
        { label: 'Travel Tips', value: 'travel-tips' },
        { label: 'Payments', value: 'payments' },
      ],
      defaultValue: 'general',
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
    {
      name: 'active',
      type: 'checkbox',
      label: 'Published',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
