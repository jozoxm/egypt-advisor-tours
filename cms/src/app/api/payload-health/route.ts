import { NextResponse } from 'next/server'

/**
 * GET /api/payload-health
 *
 * Lightweight liveness check for the Payload CMS Next.js process.
 * The Express server probes this endpoint (falling back to the CMS root) to
 * determine whether the CMS is up before serving the /admin panel.
 *
 * Always returns 200 so long as the process is alive and Next.js is
 * routing requests — no database or collection access is performed.
 */
export function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}
