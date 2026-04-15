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

# Copy the Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# /app/public is optional (Payload does not require a public dir by default)
# Use a shell conditional so the build succeeds even when the folder is absent.
RUN if [ -d /app/public ]; then cp -r /app/public ./public; fi

EXPOSE 3001

ENV NODE_ENV=production
ENV CMS_PORT=3001

CMD ["node", "server.js"]
