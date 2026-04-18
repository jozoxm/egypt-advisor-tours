import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the CMS to run on a different port to the main Express server.
  // In production the admin panel is reverse-proxied from the main domain
  // via http-proxy-middleware in server/index.js.
}

export default withPayload(nextConfig)
