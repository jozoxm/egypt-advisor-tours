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

# Copy package manifests and built output; install prod-only deps in this
# stage so the image stays lean while still being able to run `next start`.
COPY --from=builder /app/package*.json ./
RUN npm ci --production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3001

ENV NODE_ENV=production
ENV CMS_PORT=3001

CMD ["npm", "run", "start"]
