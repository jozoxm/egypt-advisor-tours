# Multi-stage build — keeps the final image lean by excluding
# dev dependencies and the React source tree.

# ── Stage 1: Build the React client ──────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files (includes postinstall that builds the client)
COPY package*.json ./
COPY scripts/ ./scripts/

# Copy the client source so scripts/build-client.js can build it
COPY client/ ./client/

# Install all deps (including devDeps so the build works)
RUN npm install --production=false

# Build produces /app/build (CRA output is placed at project root by build-client.js)

# ── Stage 2: Production image ─────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy root package files and install production deps only
COPY package*.json ./
RUN npm install --production --ignore-scripts

# Copy server source
COPY server/ ./server/
COPY index.js ./

# Copy the React build produced in stage 1
COPY --from=builder /app/build ./build

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "index.js"]
