# Free Jira + MCP + Next.js ADLC Learning POC

This starter kit is for learning a complete agent-assisted development lifecycle without introducing unnecessary application complexity.

## Target flow

```text
Jira Free
  -> Atlassian MCP
  -> Coding Agent (free/local option: Cline + Ollama)
  -> Next.js
  -> local validation
  -> GitHub / GitHub MCP
  -> Pull Request
  -> GitHub Actions
  -> staging branch
  -> Vercel Preview
  -> human QA
  -> Jira Done
```

## Start here
1. Read `docs/01-ARCHITECTURE.md`.
2. Configure Jira using `docs/02-JIRA-SETUP.md`.
3. Connect Atlassian MCP using `docs/03-ATLASSIAN-MCP.md`.
4. Set up your free local agent using `docs/04-FREE-CODING-AGENT.md`.
5. Create a GitHub repository and staging branch with `docs/05-GITHUB-MCP-AND-GIT.md`.
6. Connect the repository to Vercel using `docs/07-VERCEL-STAGING.md`.
7. Complete `docs/08-END-TO-END-FIRST-TASK.md` exactly once before automating more.

## Local app setup
Recommended: Node.js 24 LTS.

```bash
cp .env.example .env.local
npm install
npm run validate
npm run dev
```

Then open `http://localhost:3000`.

## Important
Do not add Jira, GitHub or MCP credentials to `.env.local`. Authentication belongs to the relevant MCP/OAuth integration.

## Docs
- `01-ARCHITECTURE.md` - what each component does
- `02-JIRA-SETUP.md` - exact learning Jira setup
- `03-ATLASSIAN-MCP.md` - Jira MCP connection
- `04-FREE-CODING-AGENT.md` - local/free agent approach
- `05-GITHUB-MCP-AND-GIT.md` - branch and GitHub MCP model
- `06-GITHUB-ACTIONS-CI.md` - deterministic checks
- `07-VERCEL-STAGING.md` - staging deployment
- `08-END-TO-END-FIRST-TASK.md` - complete lifecycle walkthrough
- `09-ENV-AND-SECRETS.md` - where configuration belongs
- `10-TROUBLESHOOTING.md` - common problems
- `11-LEARNING-CHECKLIST.md` - mastery checklist
- `12-AGENT-AUTOMATION.md` - Jira ticket → agent → pull request automation
