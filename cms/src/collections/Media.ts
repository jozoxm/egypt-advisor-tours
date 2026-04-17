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
// Override the storage directory via environment variable:
//   MEDIA_PATH   — absolute path to the upload directory  (default: <project-root>/media)
//
// The public URL is automatically derived from PAYLOAD_SERVER_URL + "/media/"
// by Payload v3; staticURL is no longer a supported UploadConfig option in v3.
const staticDir = process.env.MEDIA_PATH || path.resolve(dirname, '../../../media')

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
