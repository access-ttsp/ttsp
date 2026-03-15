---
name: 2025-03-15 Issues page padding
overview: "Выровнять паддинг строки «Issues» + кнопка «New issue» и таблицы: обернуть оба блока в один контейнер с единым px-4 lg:px-6 и убрать дублирующий паддинг из IssuesTable."
todos: []
isProject: false
---

# Issues Page Padding Alignment

## Goal

Align horizontal padding between the "Issues" title row and the table by moving both into a shared container with a single `px-4 lg:px-6` source.

## Root Cause

- Page [src/app/(restricted)/[slug]/projects/[id]/issues/page.tsx](src/app/(restricted)/[slug]/projects/[id]/issues/page.tsx): content wrapper has `p-4 pt-0`, header row is a direct child.
- [src/components/issues-table.tsx](src/components/issues-table.tsx) (line 332): root div adds its own `px-4 lg:px-6`, shifting table content inward vs. the header.

## Implementation

### 1. Cleanup plans folder

Delete from `.cursor/plans/` any plans older than 7 days (by YYYY-MM-DD in filename) or without `YYYY-MM-DD_` prefix.

### 2. Page: shared container with padding

In [src/app/(restricted)/[slug]/projects/[id]/issues/page.tsx](src/app/(restricted)/[slug]/projects/[id]/issues/page.tsx):

- Replace the content div `flex flex-1 flex-col gap-4 p-4 pt-0` with `flex flex-1 flex-col pt-0 pb-4` (no horizontal padding from parent).
- Add inner wrapper `flex flex-col gap-4 px-4 lg:px-6` that contains both the Issues header row and IssuesTable:

```tsx
<div className="flex flex-1 flex-col pt-0 pb-4">
  <div className="flex flex-col gap-4 px-4 lg:px-6">
    <div className="flex flex-row items-center justify-between gap-4">
      <h1 className="font-semibold text-2xl">Issues</h1>
      <Button asChild size="sm">...</Button>
    </div>
    <IssuesTable ... />
  </div>
</div>
```

### 3. IssuesTable: remove internal padding

In [src/components/issues-table.tsx](src/components/issues-table.tsx) (line 332):

- Change root div from `flex w-full flex-col gap-4 px-4 lg:px-6` to `flex w-full flex-col gap-4`.

### 4. Testing and commit

- Ask the user to test: open Issues page, verify that the "Issues" row and table share the same left/right alignment.
- Do NOT commit or push until the user confirms.
- Only after confirmation — commit and push.
