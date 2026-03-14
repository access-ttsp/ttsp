---
name: 2025-03-15 Remove posts
overview: Remove the posts feature entirely: database schema, Elysia API, dashboard pages, and all occurrences. Use bun migrate for schema generation and migration.
todos:
  - id: delete-posts-pages
    content: Delete dashboard posts pages and components
  - id: delete-posts-module
    content: Delete src/modules/posts (index, model, service)
  - id: delete-posts-schema
    content: Delete src/db/schema/posts.ts
  - id: update-elysia
    content: Remove posts from src/elysia.ts
  - id: run-migrate
    content: Run bun migrate to generate and apply migration
  - id: save-plan
    content: Ensure plan is saved to .cursor/plans/ in workspace (per plans rule)
isProject: false
---

# Remove Posts Feature

## Scope

Remove all posts-related code: schema, API, pages, and components.

## Files to Delete

- `src/app/(restricted)/dashboard/posts/` (entire directory: page.tsx, posts-list.tsx, new/, [id]/)
- `src/modules/posts/` (index.ts, model.ts, service.ts)
- `src/db/schema/posts.ts`

## Files to Modify

- [src/elysia.ts](src/elysia.ts): Remove `import { posts } from "./modules/posts"` and `.use(posts)`

## Implementation Steps

1. **Cleanup plans folder** — Delete from `.cursor/plans/` files older than 7 days (by YYYY-MM-DD in filename) or without `YYYY-MM-DD_` prefix.
2. **Delete dashboard posts directory** — Remove `src/app/(restricted)/dashboard/posts/` and all nested files.
3. **Delete posts module** — Remove `src/modules/posts/` (index, model, service).
4. **Delete posts schema** — Remove `src/db/schema/posts.ts`.
5. **Update Elysia** — Remove posts import and `.use(posts)` from [src/elysia.ts](src/elysia.ts).
6. **Generate and apply migration** — Run `bun migrate`. This runs better-auth migrations, then `drizzle-kit generate` (creates DROP TABLE migration for posts), then `drizzle-kit migrate` (applies it).
7. **Plan location** — Ensure this plan is saved to `.cursor/plans/` in the workspace, as required by the plans rule (plans MUST be saved to `.cursor/plans/` in the workspace).

## Notes

- No sidebar/navigation links to posts; dashboard layout redirects to `/app`.
- `@/actions/posts` is imported by pages but the file does not exist (posts were never migrated to app-route actions).
- Posts table has no foreign keys from other tables; safe to drop.
