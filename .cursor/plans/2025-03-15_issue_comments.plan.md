---
name: 2025-03-15 Issue comments
overview: Добавление возможности комментировать issues: таблица в БД, модуль комментариев, форма и вывод комментариев на странице детального просмотра issue.
todos:
  - id: cleanup-plans
    content: Cleanup plans folder
  - id: db-schema
    content: Add issue_comments table to DB schema
  - id: comments-module
    content: Add comments module (model, service)
  - id: actions
    content: Add insertComment action for issue page
  - id: form-component
    content: Add insert comment form component
  - id: page-update
    content: Add form and comments list to issue detail page
  - id: migrate
    content: Run bun migrate
  - id: save-plan
    content: Save plan to .cursor/plans/
  - id: test-and-commit
    content: Ask user to test, then commit and push
isProject: false
---

# Issue Comments Feature

## Goal

Add the ability to comment on issues: database table, comments module, form on the issue detail page, and display of comments.

## Key Decisions

- **Schema pattern** — Follow [src/db/schema/projects.ts](src/db/schema/projects.ts) exactly: use `createInsertSchema`, `createSelectSchema`, `createUpdateSchema` from drizzle-typebox, export `IssueCommentsInsert`, `IssueCommentsSelect` types. Export `InsertCommentBody = Omit<IssueCommentsInsert, "id" | "issueId" | "userId" | "createdAt">` for service/actions.
- **Form validation** — Use `Type.Omit(issueCommentsInsertSchema, ["id", "issueId", "userId", "createdAt"])` from schema (derived from insert schema). Form uses this schema and `InsertCommentBody` for submit payload.
- **Page** — Form and comments list go on the issue detail page [src/app/(restricted)/[slug]/projects/[id]/issues/[issueId]/page.tsx](src/app/(restricted)/[slug]/projects/[id]/issues/[issueId]/page.tsx).

## Implementation Steps

### 1. Cleanup plans folder

Delete from `.cursor/plans/` any plans older than 7 days (by YYYY-MM-DD in filename) or without `YYYY-MM-DD_` prefix.

### 2. Database schema

Add [src/db/schema/issue-comments.ts](src/db/schema/issue-comments.ts) by analogy with [src/db/schema/projects.ts](src/db/schema/projects.ts):

```ts
// issue-comments table: id, issue_id (FK issues, cascade), user_id (FK users, cascade), body (text), created_at (integer)
// Export: issueCommentsInsertSchema, issueCommentsSelectSchema, issueCommentsUpdateSchema
// Export types: IssueCommentsInsert, IssueCommentsSelect
```

- `issue_id` → references `issuesTable.id` with `onDelete: "cascade"`
- `user_id` → references `usersTable.id` with `onDelete: "cascade"`
- `body` — text, not null
- `created_at` — integer (unix timestamp), not null

Additionally export `insertCommentBodySchema = Type.Omit(issueCommentsInsertSchema, ["id", "issueId", "userId", "createdAt"])` for form validation and `type InsertCommentBody = Omit<IssueCommentsInsert, "id" | "issueId" | "userId" | "createdAt">`.

### 3. Comments module

**Model** [src/modules/comments/model.ts](src/modules/comments/model.ts): not required for form — schema contains everything. Add empty model or add `issueIdParamsSchema` for future API routes.

**Service** [src/modules/comments/service.ts](src/modules/comments/service.ts):

- `insertComment(userId, issueId, data: InsertCommentBody)` — verify access via IssuesService.getIssueById, insert comment with `created_at = now`
- `getCommentsByIssueId(userId, issueId)` — return `IssueCommentsSelect[]`, verify access via IssuesService.getIssueById, JOIN with issues/projects/team_members for ACL

### 4. Server action

Add [src/app/(restricted)/[slug]/projects/[id]/issues/[issueId]/actions.ts](src/app/(restricted)/[slug]/projects/[id]/issues/[issueId]/actions.ts):

- `insertComment(slug, projectId, issueId, data: InsertCommentBody)` — "use server", get session, parse ids, call `CommentsService.insertComment`, `revalidatePath` for the issue page

### 5. Comment form component

Add [src/components/insert-comment-form.tsx](src/components/insert-comment-form.tsx):

- Client component, props: `slug`, `projectId`, `issueId`
- useForm with `insertCommentBodySchema` and `InsertCommentBody` from `@/db/schema/issue-comments`, typeboxResolver
- Single textarea for body + submit button
- Call `insertComment` from actions on submit, toast on error

### 6. Update issue detail page

In [src/app/(restricted)/[slug]/projects/[id]/issues/[issueId]/page.tsx](src/app/(restricted)/[slug]/projects/[id]/issues/[issueId]/page.tsx):

- Fetch comments via `CommentsService.getCommentsByIssueId(session.user.id, issueIdNum)`
- Add section below the issue card:
  - Comments list (Card or list of comment items: body, author, createdAt)
  - InsertCommentForm component
- For author display: use `userId` — show "You" when `userId === session.user.id`, else "User" (or `userId` slice) for others

### 7. Run migrations

```bash
bun migrate
```

### 8. Plan location

Ensure this plan is saved to `.cursor/plans/` in the workspace with filename `2025-03-15_issue_comments.plan.md`.

### 9. Testing and commit

- Ask the user to test: insert comment on an issue, verify it appears, verify "You" vs other user display, verify validation (empty body).
- Do NOT commit or push until the user confirms (e.g. "ok", "works", "всё ок").
- Only after confirmation — commit and push.
