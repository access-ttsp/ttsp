TTSP

- Bun-first and bun-only project
- Next.js
- Tailwind CSS
- Ultracite
- Shadcn + Kibo UI
- Drizzle for database migrations
- Elysia for API (yes, instead of Next.js/app/api)
- Cursor MCP, Rules, Commands
- Docker-file

Just run

```bash
bun run better-auth:db:generate
bun run better-auth:db:migrate
bun run app:db:generate
bun run app:db:migrate
bun run dev
```

And you'are good to go!