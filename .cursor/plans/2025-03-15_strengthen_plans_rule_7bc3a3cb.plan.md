---
name: 2025-03-15 Strengthen plans rule
overview: Make the plans rule in `.cursor/rules/plans.mdc` mandatory and minimal so the Cursor planning tool always creates date-prefixed plans saved to the workspace.
todos: []
isProject: false
---

# Strengthen Plans Rule

## Problem

The current rule in [.cursor/rules/plans.mdc](.cursor/rules/plans.mdc) is advisory ("Add the date", "Always save"). It's not followed consistently: some plans lack dates, some land in `~/.cursor/plans/` instead of the workspace.

## Solution

Rewrite the rule to be **mandatory** and **minimal**:

1. Use MUST/REQUIRED language — not "add" or "always", but "MUST include", "MUST save"
2. Specify exact format: `YYYY-MM-DD_` prefix (today's date) in the plan `name` when calling CreatePlan
3. Specify explicit path: `.cursor/plans/` in the workspace
4. Keep it short — 3–4 bullet points max

## Proposed Rule Content

```md
---
alwaysApply: true
---
- Before creating a plan: MUST read and analyze 3 most recent plans from `.cursor/plans/` (by date in filename or mtime). Follow their structure, sections, and style — the format evolves as the user refines the project.
- Plans MUST be saved to `.cursor/plans/` in the workspace.
- Plan filename MUST start with `YYYY-MM-DD_` (today's date). When calling CreatePlan, set `name` to `YYYY-MM-DD short_description` (e.g. `2025-03-15 Move actions`).
- Show plans in English.
- After implementation: ask user to test; if they confirm success, commit and push.
```

## Rationale

- **Analyze recent plans** — format evolves with project understanding; recent plans reflect current preferences
- **Strong language** ("MUST") reduces ambiguity
- **Explicit `name` format** directly targets CreatePlan — the AI controls this parameter
- **Explicit path** ( `workspace/.cursor/plans/`) avoids confusion with global Cursor plans
- **Short** — easier to follow and harder to overlook

## Implementation Steps

1. **Cleanup plans folder** — Delete from `.cursor/plans/` files older than 7 days (by YYYY-MM-DD in filename) or without `YYYY-MM-DD_` prefix.
2. **[.cursor/rules/plans.mdc](.cursor/rules/plans.mdc)** — Replace the body with the proposed content.

