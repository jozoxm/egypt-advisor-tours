import type { CollectionConfig } from 'payload'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'author', 'date', 'featured'],
    description: 'Blog posts shown on the Blogs page.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Blog Title',
      required: true,
    },
    {
      name: 'author',
      type: 'text',
      label: 'Author',
      required: true,
      defaultValue: 'Egypt Advisor Team',
    },
    {
      name: 'date',
      type: 'date',
      label: 'Publish Date',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt / Summary',
      admin: { description: 'Short preview shown on the blog listing page.' },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Full Content',
    },
    {
      name: 'image',
      type: 'text',
      label: 'Emoji Icon',
      admin: { description: 'Fallback emoji, e.g. 🗺️' },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Image (upload)',
      admin: {
        description: 'Upload a blog cover image. Shown instead of the emoji when set.',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      options: [
        { label: 'Travel Tips', value: 'Travel Tips' },
        { label: 'History & Culture', value: 'History & Culture' },
        { label: 'Food & Cuisine', value: 'Food & Cuisine' },
        { label: 'Adventure', value: 'Adventure' },
        { label: 'Practical Guide', value: 'Practical Guide' },
      ],
      defaultValue: 'Travel Tips',
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Post',
      defaultValue: false,
    },
  ],
}
