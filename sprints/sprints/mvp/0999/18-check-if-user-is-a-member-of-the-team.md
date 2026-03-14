Task:
- Check if the user is a member of a team, and if not, prompt them to create one
- If the user has no team, show a guard screen with a prompt to create a team. The user cannot work with the system without being a team member. There should be a form similar to team creation but without the rest of the layout. That is, if the user is not a team member, the only thing they can do in the interface is create a team.
- Choose the best module to place this in
- Create the corresponding methods in that module's service
- Automatically add the user to the created team as owner
- In the `TeamSwitcher` list, display the teams the user belongs to and a "create team" button
- In the `TeamSwitcher` list, display the user's role in each team

Current Interface:
- Sidebar consists of 3 parts: popout menu `TeamSwitcher` at the top, main area `NavMain`, and at the bottom popout menu `NavUser`

Data Structure:
- Tables `users`, `teams`, and `team_members` exist in `app database`
- `team_members`: `user_id`, `team_id`, `role` (owner, admin, member, viewer)

Additionally:
- Use `bun run fix` for verification. Ignore errors unrelated to your task.

Important:
- **Do not do anything outside the current task.**
- Before implementing, analyze my solution and state the pros and cons.

Preparation:
- Study Drizzle documentation
- Use repomix pack and repomix attach output to pack src and analyze the code

