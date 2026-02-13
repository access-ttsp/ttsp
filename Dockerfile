FROM oven/bun:1 AS base

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* bunfig.toml ./
RUN bun install --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV BETTER_AUTH_URL=http://localhost:3000
ENV BETTER_AUTH_SECRET=build-placeholder
ENV BETTER_AUTH_DATABASE_URL=./data/better-auth.db
ENV DATABASE_URL=./data/app.db

RUN bun run build

# --- Runtime ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# drizzle migrations
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/package.json ./package.json

# entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# data directory (mount point for volume)
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
