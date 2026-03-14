Task:
- Add a table for linking users and teams
- One user can belong to multiple teams
- The table should have the following fields:
  - `user_id` - reference to the user
  - `team_id` - reference to the team
  - `role` - user's role in the team. Possible values: `owner`, `admin`, `member`, `viewer`

Additionally:
- Tables `users` and `teams` exist in `app database`
- Use `bun run migrate` to run migrations; this command will both generate and apply migrations
- Use `bun run fix` for verification. Ignore errors unrelated to your task.


Important:
- **Do not do anything outside the current task.**
- Before implementing, analyze my solution and state the pros and cons.

Preparation:
- Study Drizzle documentation

