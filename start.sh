#!/bin/bash
set -e
export PATH="$HOME/.bun/bin:$PATH"

cd "$(dirname "$0")"

echo "🏗️  Building frontend..."
cd apps/web && bun run build && cd ../..

echo "🚀 Starting server on http://localhost:3456"
bun run apps/server/src/index.ts
