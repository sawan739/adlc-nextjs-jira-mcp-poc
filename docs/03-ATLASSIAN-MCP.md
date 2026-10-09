# Atlassian MCP Setup

## What MCP does here
MCP lets the coding agent retrieve and update Jira without copying issue text manually.

```text
Coding Agent -> Atlassian MCP -> Jira
```

## Official remote endpoint
`https://mcp.atlassian.com/v2/mcp`

The official remote MCP flow uses Atlassian authentication/OAuth, so do not place Jira passwords or API tokens in the Next.js `.env.local` file.

## Claude Code example
If you later use Claude Code:

```bash
claude mcp add --transport http atlassian https://mcp.atlassian.com/v2/mcp
```

Open Claude Code and run:

```text
/mcp
```

Complete Atlassian authorization in the browser.

## Cline / other MCP client
Use the client's MCP Servers configuration and add a remote/HTTP server whose URL is:

```text
https://mcp.atlassian.com/v2/mcp
```

Authorize the Atlassian account when the client prompts you.

The exact button/menu name varies by MCP client version. The endpoint and OAuth authorization are the important pieces.

## Test read-only first
Ask:

```text
Using Atlassian MCP, retrieve Jira issue ADLC-3.
Return key, summary, description, acceptance criteria and current status.
Do not modify Jira or source code.
```

## Then test one safe write
Ask:

```text
Add this comment to ADLC-3:
"Atlassian MCP write connection validated."
Do not change status.
```

## Recommended permissions model
First phase:
- Read issue: allowed
- Read comments: allowed
- Add comment: allowed
- Transition issue: manual/explicit command only
- Delete issue: never needed

Do not allow the agent to close a ticket simply because it claims the code is complete. Move to Done only after staging verification.
