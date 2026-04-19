import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the CMS to run on a different port to the main Express server.
  // In production the admin panel is reverse-proxied from the main domain
  // via http-proxy-middleware in server/index.js.

  // The CMS is built on the GitHub Actions runner (not on the Hostinger
  // server) to avoid EAGAIN errors caused by Next.js spawning worker
  // processes on a host with a low per-user process-count limit.
  // TypeScript types are checked separately via `npm run typecheck` in CI.
  typescript: { ignoreBuildErrors: true },
}

export default withPayload(nextConfig)
