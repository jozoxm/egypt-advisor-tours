import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Uploaded files are stored in a `media/` directory at the project root
// (two levels up from cms/src/collections/).  This keeps them alongside the
// Payload SQLite database in the persistent data volume on Hostinger and is
// separate from the git-tracked source code.
//
// Override the storage directory and/or the public URL via environment vars:
//   MEDIA_PATH   — absolute path to the upload directory  (default: <project-root>/media)
//   MEDIA_URL    — public URL prefix for served images     (default: /media)
const staticDir = process.env.MEDIA_PATH || path.resolve(dirname, '../../../media')
const staticURL = process.env.MEDIA_URL || '/media'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Admin',
    description: 'Uploaded images and files used across the website.',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
  },
  upload: {
    staticDir,
    staticURL,
    // Accept any image format the browser can render.
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      admin: {
        description: 'Describe the image for accessibility and SEO.',
      },
    },
  ],
}
