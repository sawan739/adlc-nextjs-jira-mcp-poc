# Free Coding Agent Option

## Goal
Avoid LLM API charges while learning the lifecycle.

## Option
Use Cline with Ollama and a local coding-capable model.

Conceptually:

```text
Cline -> Ollama -> local model
```

This avoids an external model API key, but quality and speed depend on your machine and model size.

## Practical approach
1. Install Ollama.
2. Pull a coding-capable model supported by your hardware.
3. Install Cline in VS Code or its CLI.
4. Configure Cline to use Ollama/local model.
5. Add Atlassian MCP to Cline.

## Important
A local model can be weaker than frontier paid coding models. For the POC, that is acceptable because your learning goal is the ADLC architecture and controls.

Keep the deterministic safety net:
- `git diff`
- `npm run validate`
- GitHub Actions
- human review
