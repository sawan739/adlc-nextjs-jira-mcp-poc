# Troubleshooting

## npm install: `edgesOut` error
This is an npm dependency-resolver failure sometimes seen with certain npm versions/dependency states.

Recommended learning environment:
- Node.js 24 LTS
- stable npm version
- pinned package majors/versions

Check:

```bash
node -v
npm -v
```

If needed, use nvm to switch Node and retry from a clean install.

## Jira MCP cannot see issue
Check:
1. You authenticated the same Atlassian account that owns/has access to the Jira project.
2. The issue key is correct, e.g. `ADLC-3`.
3. The MCP client shows the Atlassian server as connected.
4. Try a read-only search before a write operation.

## Jira UI does not match guide
Atlassian frequently updates navigation labels. Preserve the intended configuration:
- Kanban project
- workflow statuses listed in this guide
- issue types
- task template

The exact menu labels can differ.

## CI fails but local succeeds
Confirm:
- Node version matches CI
- lockfile is committed
- local environment is not hiding required configuration
- `npm ci` succeeds from a clean clone

## Vercel staging not created
Confirm:
- repository is connected to Vercel
- `main` is the production branch
- `staging` has been pushed to GitHub
- Vercel Git integration is enabled

## Local model is slow/weak
Use a smaller model that fits memory. Keep the workflow the same; model choice is replaceable.
