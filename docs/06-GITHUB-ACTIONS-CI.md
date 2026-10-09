# GitHub Actions CI

The included `.github/workflows/ci.yml` runs for pull requests into `staging` or `main`.

Validation order:
1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`

## Why this matters
The coding agent is probabilistic. CI is deterministic.

```text
Agent says "done"
      |
      v
CI independently verifies
```

A failed CI check means the change is not ready regardless of the agent's explanation.

## Recommended repository settings
For a personal free POC, enable what your GitHub plan allows:
- pull requests for staging/main
- require status checks where available
- avoid direct push to main
- squash merge is easy to read for learning

Even if branch-rule features vary by repository/account type, follow the behavior manually: no merge until CI passes.
