import type { CollectionConfig } from 'payload'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'category', 'featured', 'uploadDate'],
    description: 'Photo gallery images shown on the website.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Image Title',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Image URL',
      required: false,
      admin: { description: 'External URL to the image (leave blank if uploading below).' },
      validate: (value: string | null | undefined, { data }: { data: Record<string, unknown> }) => {
        // At least one image source (URL string or uploaded file) is required.
        if (!value && !data?.photo) {
          return 'Please provide either an Image URL or upload an image.'
        }
        return true
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Image (upload)',
      admin: {
        description: 'Upload a gallery image directly. Takes precedence over Image URL when both are set.',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      options: [
        { label: 'Pyramids', value: 'Pyramids' },
        { label: 'Temples', value: 'Temples' },
        { label: 'Nile', value: 'Nile' },
        { label: 'Desert', value: 'Desert' },
        { label: 'People', value: 'People' },
        { label: 'Cairo', value: 'Cairo' },
        { label: 'Other', value: 'Other' },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Image',
      defaultValue: false,
    },
    {
      name: 'uploadDate',
      type: 'date',
      label: 'Upload Date',
    },
  ],
}
