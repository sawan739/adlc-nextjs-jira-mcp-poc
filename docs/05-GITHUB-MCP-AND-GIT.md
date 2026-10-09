# Git + GitHub + GitHub MCP

## Branch model

```text
main          production branch
  ^
staging       learning staging integration branch
  ^
feature/ADLC-3-add-task
```

For the POC:
- Never push feature code directly to `main`.
- Feature PRs target `staging`.
- Validate on staging/Vercel preview.
- Later create a PR from `staging` to `main` when you want to practice production promotion.

## Create staging branch
Run:

```bash
./scripts/create-staging.sh
```

or manually:

```bash
git checkout main
git pull origin main
git checkout -b staging
git push -u origin staging
```

## Start a feature

```bash
./scripts/start-feature.sh ADLC-3 add-task
```

## GitHub MCP
GitHub provides an official MCP server. A local official build can authenticate with browser OAuth, which avoids keeping a PAT in the application repo.

Use GitHub MCP for controlled repository operations such as:
- inspect repository/PR data
- create a pull request
- read CI/PR state

For the first POC, do not use the agent to merge the PR.

## Example PR creation instruction

```text
Using GitHub MCP, create a pull request from
feature/ADLC-3-add-task to staging.

Title:
feat(ADLC-3): add task creation

Include Jira issue, summary, validation performed and risks.
Do not merge the PR.
```
