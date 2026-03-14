---
name: Move module actions to app routes
overview: Перенос Server Actions из `src/modules/*/actions.ts` в `src/app/` рядом с соответствующими страницами, т.к. actions — часть Next.js роута, а не модуля. Обновление импортов в формах.
todos: []
isProject: false
---

# Move Module Actions to App Routes

## Current State

Actions currently live in modules:

- [src/modules/projects/actions.ts](src/modules/projects/actions.ts) — `createProject`
- [src/modules/issues/actions.ts](src/modules/issues/actions.ts) — `createIssue`, `updateIssue`
- [src/modules/teams/actions.ts](src/modules/teams/actions.ts) — `createTeam`

They are imported by shared form components in `src/components/`:

- [create-project-form.tsx](src/components/create-project-form.tsx)
- [create-issue-form.tsx](src/components/create-issue-form.tsx)
- [edit-issue-form.tsx](src/components/edit-issue-form.tsx)
- [create-team-form.tsx](src/components/create-team-form.tsx)

## Target Structure

- **createProject** → `src/app/(restricted)/[slug]/projects/new/actions.ts` (used by [slug]/projects/new via CreateProjectForm)
- **createIssue** → `src/app/(restricted)/[slug]/projects/[id]/issues/new/actions.ts` (used by issues/new via CreateIssueForm)
- **updateIssue** → `src/app/(restricted)/[slug]/projects/[id]/issues/edit/[issueId]/actions.ts` (used by EditIssueForm)
- **createTeam** → `src/app/(restricted)/[slug]/teams/new/actions.ts` (primary route; used by CreateTeamForm on [slug]/teams/new, settings/teams/new, onboarding/team, dashboard/teams/new)

**Note on createTeam:** Placed next to the primary route `[slug]/teams/new`; other pages use the same form component which imports from this location.

## Implementation Steps

1. **Cleanup plans folder** — Delete from `.cursor/plans/` files older than 7 days (by YYYY-MM-DD in filename) or without `YYYY-MM-DD_` prefix.
2. **Create actions files in app directory** — Copy each action file content, update imports to use module paths for types and services (e.g. `@/modules/projects/model`, `@/modules/projects/service`).
3. **Update form component imports:**
  - `create-project-form.tsx`: `@/modules/projects/actions` → `@/app/(restricted)/[slug]/projects/new/actions`
  - `create-issue-form.tsx`: `@/modules/issues/actions` → `@/app/(restricted)/[slug]/projects/[id]/issues/new/actions`
  - `edit-issue-form.tsx`: `@/modules/issues/actions` → `@/app/(restricted)/[slug]/projects/[id]/issues/edit/[issueId]/actions`
  - `create-team-form.tsx`: `@/modules/teams/actions` → `@/app/(restricted)/[slug]/teams/new/actions`
4. **Delete module action files:**
  - `src/modules/projects/actions.ts`
  - `src/modules/issues/actions.ts`
  - `src/modules/teams/actions.ts`

## Import Path Note

Actions will import types and services from modules:

```typescript
import type { CreateProjectBody } from "@/modules/projects/model";
import { ProjectsService } from "@/modules/projects/service";
```

Modules retain: `model` (types, schemas), `service` (business logic). Only `actions.ts` is removed from each module.