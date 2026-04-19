import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: {
    useAsTitle: 'customerName',
    group: 'Customer Data',
    defaultColumns: ['customerName', 'tourName', 'bookingDate', 'status', 'createdAt'],
    description:
      'Booking requests submitted via the website. New records are created by the Express booking API, not through this panel.',
  },
  access: {
    // Only authenticated admins can view, update, or delete bookings.
    // Public creation is intentionally disabled here — the Express API
    // handles customer submissions and writes directly to the database.
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      label: 'Customer Name',
    },
    {
      name: 'customerEmail',
      type: 'email',
      label: 'Customer Email',
    },
    {
      name: 'customerPhone',
      type: 'text',
      label: 'Customer Phone',
    },
    {
      name: 'tourId',
      type: 'text',
      label: 'Tour ID',
    },
    {
      name: 'tourName',
      type: 'text',
      label: 'Tour Name',
    },
    {
      name: 'bookingDate',
      type: 'date',
      label: 'Requested Booking Date',
    },
    {
      name: 'numberOfPeople',
      type: 'number',
      label: 'Number of People',
    },
    {
      name: 'priceCategory',
      type: 'select',
      label: 'Price Category',
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Group', value: 'group' },
        { label: 'Sharing', value: 'sharing' },
      ],
      defaultValue: 'individual',
    },
    {
      name: 'totalPrice',
      type: 'text',
      label: 'Total Price',
    },
    {
      name: 'specialRequests',
      type: 'textarea',
      label: 'Special Requests',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: '⏳ Pending', value: 'pending' },
        { label: '✅ Confirmed', value: 'confirmed' },
        { label: '❌ Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'source',
      type: 'select',
      label: 'Source',
      options: [
        { label: 'Customer (Website)', value: 'customer' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'customer',
    },
    {
      name: 'externalId',
      type: 'text',
      label: 'Legacy ID',
      admin: {
        description: 'ID from the legacy JSON bookings file (used during migration).',
        position: 'sidebar',
      },
    },
  ],
}
