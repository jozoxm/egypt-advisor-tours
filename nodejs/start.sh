#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d "server/node_modules" ]; then
  echo "[startup] server/node_modules missing, installing dependencies..."
  npm install --prefix server --production=false --no-audit --no-fund --unsafe-perm
else
  echo "[startup] server/node_modules present, skipping install"
fi

node start.js
