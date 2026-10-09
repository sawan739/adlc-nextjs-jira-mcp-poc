# Jira Free - Complete Configuration Guide

## 1. Create a personal Jira Free site
1. Open the Jira pricing/get-started page.
2. Sign in with a personal Atlassian account or create one.
3. Select the Free plan.
4. Create a Jira site, for example `yourname-adlc.atlassian.net`.
5. For a learning POC keep only yourself as a user.

Jira Free is suitable for this POC and currently supports up to 10 users.

## 2. Create the project
Create a software project with:
- Project name: `ADLC Learning`
- Project key: `ADLC`
- Template: Kanban
- Project type: team-managed is simplest for a personal POC.

## 3. Configure workflow/statuses
Use this small workflow:

```text
Backlog
  -> Ready for Development
  -> In Progress
  -> Developer Testing
  -> Code Review
  -> QA / Staging
  -> Done
```

In a team-managed project:
1. Open the project.
2. Open Project settings.
3. Find Work types / Issue types or Board/Workflow settings (labels can vary as Atlassian updates the UI).
4. Add or rename statuses so the board matches the flow above.
5. Ensure each status appears as a board column.

If your UI differs, the important result is the status model above, not the exact menu label.

## 4. Keep issue types simple
Use:
- Epic
- Story
- Task
- Bug
- Subtask

For this POC use Tasks/Stories for features and Bug for defects discovered in staging.

## 5. Suggested custom fields
For a personal POC these are optional. Add them only if you want to practice structured metadata:
- Environment: Local / Staging / Production
- ADLC Stage: Planning / Development / Testing / Review / QA / Completed
- QA Status: Not Started / Testing / Passed / Failed
- Deployment Status: Not Started / Preview Deployed / Verified

Do not store passwords, API tokens, or other secrets in Jira fields.

## 6. Create an Epic
Summary: `ADLC Task Manager POC`

## 7. Create learning tasks
- ADLC-1 - Set up Next.js project
- ADLC-2 - Display task list
- ADLC-3 - Add a task
- ADLC-4 - Edit a task
- ADLC-5 - Delete a task
- ADLC-6 - Filter tasks

## 8. Standard issue template
Use this content in every feature issue:

### Objective
One paragraph describing the user/business outcome.

### Requirements
- Requirement 1
- Requirement 2

### Acceptance Criteria
1. Observable result 1
2. Observable result 2
3. `npm run validate` passes
4. No browser console errors for the changed flow

### Testing
- lint
- typecheck
- unit test when appropriate
- build
- manual staging validation

### Definition of Done
- implementation complete
- local validation passes
- AI-assisted review complete
- PR approved
- GitHub CI passes
- staging deployment verified
- Jira updated with PR and staging links

## 9. Example ADLC-3
Summary: `Add task creation`

Objective: Allow the user to create a new task from the task manager UI.

Requirements:
- Show a task title input.
- Show an Add button.
- Reject empty/whitespace-only values.
- Display a newly created task immediately.

Acceptance Criteria:
1. Input and Add button are visible.
2. Valid task can be created.
3. Empty task is rejected with visible feedback.
4. New task is visible without page reload.
5. `npm run validate` passes.
6. Feature works on the staging preview.
