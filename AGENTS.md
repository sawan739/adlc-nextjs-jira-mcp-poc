# Agent Operating Instructions

## Project
- Next.js 16
- React 19
- TypeScript
- App Router
- Vitest

## Mandatory development workflow
1. Read the linked Jira issue through Atlassian MCP.
2. Read this file before changing code.
3. Inspect the repository and related implementation first.
4. Produce an implementation plan and testing plan before editing files.
5. Do not change unrelated files.
6. After implementation run `npm run validate`.
7. Fix validation failures before requesting review.
8. Review the diff against the target branch.
9. Never merge a pull request automatically.
10. Never push directly to `main` or bypass CI.

## Coding rules
- Use TypeScript and avoid `any` unless explicitly justified.
- Prefer simple solutions for this learning POC.
- Do not add dependencies unless they materially reduce complexity.
- Never expose secrets through `NEXT_PUBLIC_*` variables.
- Add tests for business logic introduced by a task.

## Completion report
Report:
- Jira issue
- Files changed
- What was implemented
- Validation commands/results
- Risks or limitations
