# ADLC POC Architecture

## Goal
Learn a complete agent-assisted development lifecycle while keeping application complexity and cost low.

```text
Jira Free
   |
Atlassian MCP (OAuth)
   |
Coding Agent (free/local option: Cline + Ollama)
   |
Next.js repository
   |
Local validation: lint + types + tests + build
   |
GitHub / GitHub MCP
   |
Pull Request -> GitHub Actions CI
   |
Vercel Preview from staging
   |
Human QA
   |
Jira Done
```

## Responsibility boundaries
- Jira: requirements and lifecycle state.
- MCP: controlled connector between the agent and Jira/GitHub.
- Coding agent: requirement interpretation, planning, implementation, review assistance.
- Git: source history and change isolation.
- GitHub Actions: deterministic validation.
- Vercel: preview/staging deployment.
- Human: plan approval, PR approval, staging acceptance.

## Why not automate everything first?
The first POC should make every boundary visible. After you understand the manual-assisted lifecycle, automate repetitive steps such as Jira comments, status transitions, and PR creation.
