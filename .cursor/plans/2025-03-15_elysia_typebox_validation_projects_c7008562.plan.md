---
name: 2025-03-15 Elysia TypeBox validation projects
overview: "Реализация валидации параметров в Elysia через TypeBox: использование projectsInsertSchema из schema, projectIdParamsSchema в модели модуля, замена ручной валидации на декларативную."
todos: []
isProject: false
---

# Elysia TypeBox Validation for Projects Module

## Goal

Implement correct parameter validation in Elysia using TypeBox. Use existing schemas from [src/db/schema/projects.ts](src/db/schema/projects.ts), keep `projectIdParamsSchema` in the module model, remove redundant schemas from the model.

## Key decisions

- **projectsInsertSchema** — use directly as the create schema (no derived schemas)
- **projectIdParamsSchema** — place in [src/modules/projects/model.ts](src/modules/projects/model.ts) for route params validation

## Implementation steps

1. **Plan location** — Ensure this plan is saved to `.cursor/plans/` in the workspace with filename `YYYY-MM-DD_*.plan.md`.
2. **Cleanup plans folder** — Delete from `.cursor/plans/` any plans older than 7 days (by YYYY-MM-DD in filename) or without `YYYY-MM-DD_` prefix.
3. **Update model** — In [src/modules/projects/model.ts](src/modules/projects/model.ts):
  - Remove: `createProjectFormSchema`, `CreateProjectBody`, `InferCreateProjectFormSchema`, `ProjectListItem`
  - Add: `projectIdParamsSchema` (`Type.Object({ id: Type.Number() })`)
4. **Update Elysia routes** — In [src/modules/projects/routes.ts](src/modules/projects/routes.ts):
  - Add `params: projectIdParamsSchema` to the route config (third argument of `.get()`)
  - Remove manual `parseInt` / `isNaN` validation
  - Handler receives validated `params.id` as number
5. **Update consumers** — Fix imports:
  - [src/components/create-project-form.tsx](src/components/create-project-form.tsx): use `projectsInsertSchema` and `ProjectsInsert` from `@/db/schema/projects`
  - [src/app/(restricted)/[slug]/projects/new/actions.ts](src/app/(restricted)/[slug]/projects/new/actions.ts): use `ProjectsInsert` from schema
  - [src/modules/projects/service.ts](src/modules/projects/service.ts): use `ProjectsInsert` (or pick needed fields) from schema; keep or inline `ProjectListItem` type as needed

