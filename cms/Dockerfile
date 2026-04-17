# ── CMS Dockerfile ───────────────────────────────────────────────────────────
# Builds the Payload CMS Next.js app for production.
# The resulting image is started alongside the Express server so that
# http-proxy-middleware in server/index.js can proxy /admin requests to it.

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .

# Generate the Payload import map before building
RUN npm run generate:importmap || true

RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy package manifests and built output; reinstall prod-only deps so the
# image stays lean while still being able to run `next start`.
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3001

ENV NODE_ENV=production
ENV CMS_PORT=3001

CMD ["npm", "run", "start"]
