Task:
- Add `slug` field to `teams` table in `app` database
- `slug` must be unique for each team
- Add `slug` field to `CreateTeamGuard`
- Update route from `/dashboard` to `/:slug`
- Use RHF + typebox resolver for the form

Current Interface:
- Sidebar consists of 3 parts: popout menu `TeamSwitcher` at the top, main area `NavMain`, and at the bottom popout menu `NavUser`

Data Structure:
- Tables `users`, `teams`, and `team_members` exist in `app database`
- `team_members`: `user_id`, `team_id`, `role` (owner, admin, member, viewer)

Process:
- Use `bun run migrate` for generating and applying migrations
- Use `bun run fix` for verification. Ignore errors unrelated to your task.

Important:
- **Do not do anything outside the current task.**
- Before implementing, analyze my solution and state the pros and cons.
- Do not modify existing migrations. Make changes in the table file and run `bun run migrate` to generate and apply the migration.
- Do not perform any normalization or similar logic in the action. All of that should be in the service. The action only calls the service and handles errors if any and performs redirects. The action's sole responsibility is to pass parameters to the service and handle the result.

Preparation:
- Study Drizzle documentation
- Use repomix pack and repomix attach output to pack src and analyze the code
