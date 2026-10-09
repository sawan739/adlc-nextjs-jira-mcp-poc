# End-to-End Walkthrough - ADLC-3

## Stage 1 - Jira
Create `ADLC-3 - Add task creation` using the issue template in `02-JIRA-SETUP.md`.
Set status to `Ready for Development`.

## Stage 2 - Start branch

```bash
./scripts/start-feature.sh ADLC-3 add-task
```

## Stage 3 - Ask agent to plan through MCP

```text
Start work on Jira issue ADLC-3.
Use Atlassian MCP to retrieve the complete issue.

Before changing files:
1. Read AGENTS.md.
2. Read the Jira issue and acceptance criteria.
3. Inspect the repository.
4. Explain the requirement.
5. List affected files.
6. Provide an implementation plan.
7. Provide a testing plan.
8. Identify risks/assumptions.

Do not modify files yet.
```

Move Jira to `In Progress` only after you decide to start implementation.

## Stage 4 - Human plan approval
Review the plan for:
- correct requirement understanding
- minimal scope
- no unnecessary dependency
- sensible tests

Then instruct:

```text
Plan approved. Implement ADLC-3.
Follow AGENTS.md.
Do not change unrelated files.
After implementation run npm run validate and fix failures.
Do not commit, push, merge, or change Jira to Done.
```

## Stage 5 - Developer validation
Run yourself:

```bash
npm run validate
npm run dev
```

Manually test every acceptance criterion.
Move Jira to `Developer Testing`.

## Stage 6 - AI-assisted review

```text
Review the current branch against staging.
Do not change files.
Check acceptance criteria, bugs, security, TypeScript/Next.js quality, error handling, missing tests and unrelated changes.
Classify findings Critical / High / Medium / Low.
```

Resolve valid findings and rerun `npm run validate`.
Move Jira to `Code Review`.

## Stage 7 - Commit and push

```bash
git status
git diff staging...HEAD
git add .
git commit -m "feat(ADLC-3): add task creation"
git push -u origin feature/ADLC-3-add-task
```

## Stage 8 - Pull request
Create a PR into `staging` manually or via GitHub MCP.
Do not merge until CI passes and you review the diff.

## Stage 9 - CI
Confirm GitHub Actions passes:
- lint
- typecheck
- tests
- build

## Stage 10 - Merge to staging
After human review, merge the feature PR to `staging`.

## Stage 11 - Vercel staging
Open the Vercel deployment created from `staging`.
Move Jira to `QA / Staging` and add:
- PR URL
- staging URL
- CI result

## Stage 12 - QA
Test the Jira acceptance criteria on the staging URL.

If QA fails:
- do not close the issue
- create/fix on a feature branch
- repeat PR/CI/staging

If QA passes:
- add final validation comment
- move Jira to Done

## What you learned
You completed:
Jira -> MCP -> planning -> development -> deterministic validation -> AI review -> PR -> CI -> staging deployment -> human QA -> Jira Done.
