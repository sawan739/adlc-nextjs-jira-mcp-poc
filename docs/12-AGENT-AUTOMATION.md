# Agent Automation: Jira ticket → pull request

When a ticket is created in Jira, a coding agent starts automatically, implements it, and opens a pull request to `staging`. A human always reviews and merges.

```text
Ticket created in Jira
  -> Jira Automation rule
       -> comment "ticket received" + email           (notification)
       -> web request to GitHub (repository_dispatch)
  -> GitHub Actions: .github/workflows/agent.yml
       -> validate key, fetch ticket, Definition of Ready check
          (not ready -> Jira comment, stop)            (notification)
       -> Jira: In Progress + comment with run link    (notification)
       -> branch feature/KAN-N-slug from staging
       -> Claude Code: plan -> implement -> tests -> npm run validate
       -> workflow re-runs npm run validate
       -> commit, push, PR to staging                  (GitHub notification)
       -> Jira: PR link + summary comment, In Review   (notification)
       -> on failure: Jira comment + "agent-failed" label
  -> CI on the PR -> human review and merge -> staging -> QA -> main -> Done
```

## Files

| File | Purpose |
|---|---|
| `.github/workflows/agent.yml` | The workflow |
| `scripts/agent/jira.ts` | Jira REST helper: fetch, start, review, fail, pr-body |
| `scripts/agent/lib.ts` | Pure logic (tested in `tests/agent.test.ts`) |
| `scripts/agent/prompt.md` | Instructions given to the agent |

## One-time setup

### 1. Create the tokens

| Name | Where to create | Permissions |
|---|---|---|
| Anthropic API key | console.anthropic.com → API Keys | — (billed per run) |
| Jira API token | id.atlassian.com → Security → API tokens | The Jira user it belongs to must be able to comment and transition KAN tickets. Comments appear as that user. |
| `AGENT_GH_TOKEN` | GitHub → Settings → Developer settings → Fine-grained tokens | This repository only. **Contents: read/write**, **Pull requests: read/write** |
| Jira dispatch token | Same as above, a **separate** token | This repository only. **Contents: read/write** (required by `repository_dispatch`) |

`AGENT_GH_TOKEN` is needed because pull requests opened with the default `GITHUB_TOKEN` do not trigger the CI workflow.

### 2. Add secrets and variables to GitHub

```bash
gh secret set ANTHROPIC_API_KEY
gh secret set JIRA_EMAIL
gh secret set JIRA_API_TOKEN
gh secret set AGENT_GH_TOKEN

gh variable set JIRA_BASE_URL --body "https://bitcot-8541961.atlassian.net"
gh variable set JIRA_PROJECT_KEY --body "KAN"        # optional, default KAN
gh variable set AGENT_BASE_BRANCH --body "staging"   # optional, default staging
gh variable set AGENT_REVIEWERS --body "username"    # optional; must not be the token owner
gh variable set AGENT_MAX_TURNS --body "60"          # optional cost limit
```

Each `gh secret set` prompts for the value, so it never appears in your shell history.

### 3. Get the workflow onto `main`

GitHub only runs `repository_dispatch` and `workflow_dispatch` workflows from the **default branch**. Merge this change to `staging`, then promote `staging` to `main`.

### 4. Create the Jira Automation rule

Go to Jira → Project settings → Automation → Create rule, then add:

1. **Trigger:** Work item created.
2. **Condition:** Work item fields condition → Issue Type **is one of** Task, Story.
   Recommended extra condition: Reporter is you, or Labels contains `agent`. This limits who can start the agent (see Security below).
3. **Action:** Comment on work item: `🤖 Ticket received. The ADLC agent will start shortly.`
4. **Action:** Send email to the Reporter (and Assignee): subject `{{issue.key}} picked up by the ADLC agent`.
5. **Action:** Send web request
   - URL: `https://api.github.com/repos/sawan739/adlc-nextjs-jira-mcp-poc/dispatches`
   - Method: `POST`
   - Headers:
     - `Accept: application/vnd.github+json`
     - `X-GitHub-Api-Version: 2022-11-28`
     - `Authorization: Bearer <Jira dispatch token>` (tick **Hidden**)
   - Web request body: Custom data
     ```json
     {"event_type": "jira-ticket", "client_payload": {"issue_key": "{{issue.key}}"}}
     ```
   - A success response is `204 No Content`. Use the rule's **Validate** button to check it.
6. Name the rule `ADLC agent: start on create` and turn it on.

Jira Free allows a limited number of automation rule runs per month (about 100), and each created ticket uses one.

## Running it manually

Use this for existing tickets or to retry after a failure:

```bash
gh workflow run agent.yml -f issue_key=KAN-4
gh run watch
```

Or go to GitHub → Actions → Agent → Run workflow.

## Definition of Ready (checked automatically)

The agent only starts when the ticket:
- has a summary and a description
- has an **Acceptance Criteria** section in the description
- is not an Epic
- does not have the `no-agent` label

Otherwise it comments what's missing and stops. Fix the ticket and run it again manually.

## Notifications

| Event | Where you hear about it |
|---|---|
| Ticket created | Jira comment and email (Automation rule) |
| Not ready / started / PR opened / failed | Jira comment, which emails the ticket's watchers |
| Pull request opened | GitHub notification and email (review request if `AGENT_REVIEWERS` is set) |
| CI result | GitHub checks on the PR |

## Security

Treat the ticket text as **untrusted input**: anyone who can create a ticket can influence the agent.

The current safeguards:
- The ticket key is validated before any API call. Untrusted values are passed to steps through `env`, never interpolated into scripts.
- The agent's environment contains only `ANTHROPIC_API_KEY`. Git credentials aren't persisted, and the Jira and GitHub tokens are only present in the steps that need them.
- The agent has a tool allowlist: it can read and edit files and run `npm run …`, `git status`, `git diff` and `git log`. Web access, `npm install` and pushing are not allowed.
- The workflow refuses to open a PR if the agent changed `.github/` or `scripts/agent/`.
- The workflow re-runs `npm run validate` itself. Nothing merges without human review.

Known limitations:
- Tests the agent writes run in the same step as `ANTHROPIC_API_KEY`, so a malicious ticket could try to get code written that leaks it. Restrict who can trigger the rule. Use a dedicated Anthropic key with a spend limit, and rotate it if you suspect misuse.
- Turn on branch protection on `staging` and `main` (KAN-5).

## Cost

Each run is a paid Claude API session. The cost of each run is printed in the "Run agent" step log (`cost_usd=`). `AGENT_MAX_TURNS` and the step timeouts cap it.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Jira rule shows a 404 from GitHub | The dispatch token lacks access to the repo, or the URL is wrong. |
| Rule succeeds but no workflow runs | `agent.yml` is not on `main` yet, or `event_type` isn't `jira-ticket`. |
| `Missing required environment variable` | A secret or variable from step 2 is missing. |
| Jira `401` | Wrong `JIRA_EMAIL` / `JIRA_API_TOKEN` pair. |
| PR opened but CI didn't run | The PR was created with `GITHUB_TOKEN`; set `AGENT_GH_TOKEN`. |
| "The agent made no changes" | The agent couldn't implement the ticket; read its output in the `agent-output` artifact. |
