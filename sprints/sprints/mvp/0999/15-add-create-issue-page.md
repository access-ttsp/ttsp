Task:
- Add create issue page. See architecture.
- Add view 

Interface:
Maintain interface based on src/app/(restricted)/settings/teams/new/page.tsx

Process:
- Plan actions.
- Search for references in code to maintain code style and UI style.
- Run `bun run fix` to see linter issues. Ignore issues not related to the task.

Preparation:
- Use repomix pack and repomix attach output to pack src and analyze the code. 
  Use it to maintain constent style for UI and modules.
- Study Drizzle documentation.
- Study Bun SQL documentation.

Important:
- **Do not do anything outside the current task.**
- Before implementing, analyze my solution and state the pros and cons. Display as table Pros | Cons.
- Dsplay files to modify. File | Modification reason.
- Do not perform any normalization or similar logic in the action. All of that should be in the service. The action only calls the service and handles errors if any and performs redirects. The action's sole responsibility is to pass parameters to the service and handle the result.

