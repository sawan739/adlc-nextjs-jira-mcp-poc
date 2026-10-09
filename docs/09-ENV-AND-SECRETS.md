# Environment Variables and Secrets

## Application environment variables
Only application configuration belongs in `.env.local`.

Example:

```bash
NEXT_PUBLIC_APP_NAME="ADLC Learning POC"
NEXT_PUBLIC_APP_ENV="local"
```

## Never store these in the Next.js repository
- Jira password
- Jira API token
- GitHub password
- GitHub token (if OAuth flow is available)
- MCP OAuth tokens
- Vercel login token for normal Git integration

## Where authentication lives

```text
Atlassian MCP -> Atlassian OAuth/session
GitHub MCP -> GitHub OAuth/session
Vercel -> GitHub integration authorization
Local model -> no external API key
```

## `NEXT_PUBLIC_` warning
Any Next.js variable beginning with `NEXT_PUBLIC_` may be exposed to browser-side code. Never use that prefix for a secret.
