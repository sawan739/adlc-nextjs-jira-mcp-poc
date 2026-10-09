// Pure helpers for the Jira → agent → pull request workflow.
// Everything here is side-effect free so it can be unit tested.

export type JiraIssue = {
  key: string;
  summary: string;
  description: string;
  issueType: string;
  components: string[];
  labels: string[];
};

export type JiraTransition = {
  id: string;
  name: string;
  to: { name: string };
};

// Jira rejects comments longer than 32,767 characters; keep a safe margin.
export const MAX_COMMENT_SECTION_LENGTH = 20_000;

export function parseIssueKey(input: string, projectKey: string): string | null {
  const key = input.trim().toUpperCase();
  const pattern = new RegExp(`^${escapeRegExp(projectKey.toUpperCase())}-[1-9][0-9]*$`);
  return pattern.test(key) ? key : null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function namedList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (isRecord(item) ? stringField(item.name) : ""))
    .filter((name) => name !== "");
}

// Parses a Jira REST API v2 issue response (description is wiki-markup text).
export function parseIssueResponse(json: unknown): JiraIssue {
  if (!isRecord(json) || !isRecord(json.fields)) {
    throw new Error("Unexpected Jira issue response.");
  }
  const fields = json.fields;
  return {
    key: stringField(json.key),
    summary: stringField(fields.summary),
    description: stringField(fields.description),
    issueType: isRecord(fields.issuetype) ? stringField(fields.issuetype.name) : "",
    components: namedList(fields.components),
    labels: Array.isArray(fields.labels)
      ? fields.labels.filter((label): label is string => typeof label === "string")
      : [],
  };
}

// Definition of Ready: what must be present before the agent starts work.
export function readinessProblems(issue: JiraIssue): string[] {
  const problems: string[] = [];
  if (issue.summary.trim() === "") {
    problems.push("The ticket has no summary.");
  }
  if (issue.description.trim() === "") {
    problems.push("The ticket has no description.");
  } else if (!/acceptance criteria/i.test(issue.description)) {
    problems.push('The description has no "Acceptance Criteria" section.');
  }
  if (issue.issueType.toLowerCase() === "epic") {
    problems.push("Epics are not worked on directly; create child tickets instead.");
  }
  if (issue.labels.includes("no-agent")) {
    problems.push('The ticket has the "no-agent" label.');
  }
  return problems;
}

export function slugify(text: string, maxLength = 40): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const trimmed = slug.slice(0, maxLength).replace(/-+$/g, "");
  return trimmed === "" ? "task" : trimmed;
}

export function branchName(issue: Pick<JiraIssue, "key" | "summary">): string {
  // Drop a leading "KAN-2 —" style prefix so the key is not repeated.
  const summary = issue.summary.replace(new RegExp(`^${escapeRegExp(issue.key)}\\s*[-—:]*\\s*`, "i"), "");
  return `feature/${issue.key}-${slugify(summary)}`;
}

// Maps Jira components to docs/standards files, e.g. "Backend/API" → backend-api.md.
export function standardsFiles(components: readonly string[]): string[] {
  const files = ["docs/standards/general.md", ...components.map((name) => `docs/standards/${slugify(name)}.md`)];
  return [...new Set(files)];
}

export function issueToMarkdown(issue: JiraIssue): string {
  return [
    `# ${issue.key}: ${issue.summary}`,
    "",
    `- Type: ${issue.issueType || "unknown"}`,
    `- Components: ${issue.components.join(", ") || "none"}`,
    `- Labels: ${issue.labels.join(", ") || "none"}`,
    "",
    "## Description",
    "",
    issue.description,
    "",
  ].join("\n");
}

export function findTransitionId(transitions: readonly JiraTransition[], statusName: string): string | null {
  const target = statusName.toLowerCase();
  const match = transitions.find((transition) => transition.to.name.toLowerCase() === target);
  return match ? match.id : null;
}

function truncate(text: string, maxLength = MAX_COMMENT_SECTION_LENGTH): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}\n… (truncated)` : text;
}

// Wraps text so Jira wiki markup inside it is shown verbatim.
function noformat(text: string): string {
  return `{noformat}\n${truncate(text.replaceAll("{noformat}", "{ noformat }"))}\n{noformat}`;
}

export function startedComment(runUrl: string): string {
  return `🤖 The ADLC agent has started work on this ticket.\n\nWorkflow run: ${runUrl}`;
}

export function notReadyComment(problems: readonly string[]): string {
  return [
    "🤖 The ADLC agent did not start: this ticket does not meet the Definition of Ready.",
    "",
    ...problems.map((problem) => `* ${problem}`),
    "",
    "Update the ticket, then re-run the agent workflow for this key.",
  ].join("\n");
}

export function reviewComment(prUrl: string, summary: string, runUrl: string): string {
  return [
    "🤖 The ADLC agent opened a pull request for review.",
    "",
    `Pull request: ${prUrl}`,
    `Workflow run: ${runUrl}`,
    "",
    "*Agent summary*",
    noformat(summary.trim() || "No summary was written."),
    "",
    "A human must review and merge the pull request.",
  ].join("\n");
}

export function failedComment(runUrl: string): string {
  return [
    "🤖 The ADLC agent failed on this ticket and no pull request was opened.",
    "",
    `See the workflow run for details: ${runUrl}`,
    "",
    'Fix the cause, remove the "agent-failed" label, and re-run the workflow.',
  ].join("\n");
}

export function pullRequestBody(issue: Pick<JiraIssue, "key" | "summary">, jiraBaseUrl: string, plan: string, summary: string): string {
  const base = jiraBaseUrl.replace(/\/+$/, "");
  return [
    "## Jira issue",
    `[${issue.key}](${base}/browse/${issue.key}): ${issue.summary}`,
    "",
    "## Summary",
    summary.trim() || "No summary was written.",
    "",
    "## Plan",
    plan.trim() || "No plan was written.",
    "",
    "## Validation",
    "- [x] `npm run validate` passed in the agent workflow",
    "- [ ] Manual browser validation",
    "- [ ] Human code review",
    "",
    "_Opened automatically by the ADLC agent workflow. Do not merge without review._",
  ].join("\n");
}
