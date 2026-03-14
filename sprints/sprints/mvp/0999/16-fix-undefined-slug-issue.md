Done. Create team → /settings/teams/new

Task:
Fix issue: when i click Create team in `TeamSwitcher` it redirects me to 
http://localhost:3000/undefined/teams/new which is wrong. 

Correct:
/settings/teams/new uner restricted layout 

Current Interface:
- The sidebar consists of three parts: a popout menu `TeamSwitcher` at the top, the main area `NavMain` in the center, and at the bottom, a popout menu `NavUser`.

Process:
- Use `repomix pack` on the codebase and `repomix attach` to pack `/src` and analyze the codebase.
- Use `bun run migrate` to generate and apply migrations if necessary.
- Use `bun run fix` for verification. Ignore errors unrelated to your task.

Important:
- **Do not do anything outside the current task.**
- Before implementing, analyze my solution and state its pros and cons.
- Do not modify existing migrations. Make changes in the table file and run `bun run migrate` to generate and apply the migration.
- Do not perform any normalization or similar logic in the action. All of that should be in the service. The action should only call the service, handle errors if any, and perform redirects. The action's sole responsibility is to pass parameters to the service and handle the result.
