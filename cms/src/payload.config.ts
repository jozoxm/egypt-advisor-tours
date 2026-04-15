import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sqliteAdapter } from '@payloadcms/db-sqlite'

import { Users } from './collections/Users'
import { Tours } from './collections/Tours'
import { Blogs } from './collections/Blogs'
import { Gallery } from './collections/Gallery'
import { Slideshow } from './collections/Slideshow'
import { Bookings } from './collections/Bookings'
import { Testimonials } from './collections/Testimonials'
import { FAQs } from './collections/FAQs'
import { SiteSettings } from './globals/SiteSettings'
import { ContactInfo } from './globals/ContactInfo'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// SQLite database file lives in DATA_PATH (same persistent volume used by the
// Express server for JSON files), or falls back to a local `data/` directory
// next to the cms package so local dev works out of the box.
const databasePath =
  process.env.DATABASE_PATH ||
  path.resolve(dirname, '../../data/payload.db')

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Egypt Advisor Tours',
    },
  },
  collections: [Users, Tours, Blogs, Gallery, Slideshow, Bookings, Testimonials, FAQs],
  globals: [SiteSettings, ContactInfo],
  editor: lexicalEditor(),
  db: sqliteAdapter({
    client: {
      url: `file:${databasePath}`,
    },
  }),
  secret: process.env.PAYLOAD_SECRET || 'dev-payload-secret-CHANGE-ME-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // The CMS runs on its own port; the public-facing admin URL is the main
  // domain because Express proxies /admin → CMS.
  serverURL: process.env.PAYLOAD_SERVER_URL || process.env.CMS_INTERNAL_URL || '',
})
