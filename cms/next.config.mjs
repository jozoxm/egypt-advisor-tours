import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the CMS to run on a different port to the main Express server.
  // In production the admin panel is reverse-proxied from the main domain
  // via http-proxy-middleware in server/index.js.

  // Hostinger's shared hosting enforces a low process-count limit. When
  // Next.js spawns separate Node.js worker processes for TypeScript type
  // checking or ESLint, the spawn() call fails with EAGAIN (errno -11),
  // crashing the build and leaving the CMS unable to start.  Disabling
  // these checks here prevents the extra spawns; types and lint are still
  // verified in CI (GitHub Actions) and local development.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
}

export default withPayload(nextConfig)
