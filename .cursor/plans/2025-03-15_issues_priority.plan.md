---
name: 2025-03-15 Issues priority
overview: Добавление поля priority в issues, сохранение порядка при DnD на странице /ln0/projects/:id/issues, миграции БД, SWR + SSR.
todos:
  - id: cleanup-plans
    content: Cleanup plans folder
  - id: schema
    content: Add priority field to issues schema
  - id: service-api
    content: Update IssuesService, add PATCH reorder endpoint
  - id: issues-table
    content: Persist reorder via API, mutate SWR
  - id: ssr
    content: SSR fetch issues, pass fallbackData to SWR
  - id: migrate
    content: Run bun migrate
isProject: false
---

# Issues Priority Feature

## Goal

Add priority field to issues. When reordering via drag-and-drop on `/ln0/projects/:id/issues`, persist new order as priorities. Use SWR for client fetch, SSR for initial data.

## Implementation

- **Schema** — Add `priority` integer, default 0, to [src/db/schema/issues.ts](src/db/schema/issues.ts)
- **Service** — createIssue sets priority (max+1), getIssuesByProjectId ORDER BY priority ASC, add updateIssuesPriorities
- **API** — PATCH /api/projects/:id/issues with body { issueIds: number[] }
- **IssuesTable** — handleDragEnd calls PATCH, mutate SWR (optimistic update)
- **Page SSR** — Fetch issues via IssuesService.getIssuesByProjectId, pass as fallbackData to IssuesTable
