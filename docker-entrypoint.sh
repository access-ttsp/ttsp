#!/bin/sh
set -e

echo "Running app database migrations..."
bunx drizzle-kit migrate

echo "Running better-auth database migrations..."
bunx @better-auth/cli migrate

echo "Starting server..."
exec bun server.js
