// Jira CLI used by .github/workflows/agent.yml. Runs directly on Node 24:
//   node scripts/agent/jira.ts <command> <issue-key> [args...]
//
// Commands:
//   fetch  <key>                    write .agent/issue.md, check readiness, set step outputs
//   start  <key> <runUrl>           move to In Progress and comment
//   review <key> <prUrl> <runUrl>   comment the PR link and summary, move to In Review
//   fail   <key> <runUrl>           add the agent-failed label and comment
//   pr-body <key>                   print the pull request body to stdout
//
// Environment: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY (default KAN).

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  branchName,
  failedComment,
  findTransitionId,
  issueToMarkdown,
  notReadyComment,
  parseIssueKey,
  parseIssueResponse,
  pullRequestBody,
  readinessProblems,
  reviewComment,
  standardsFiles,
  startedComment,
  type JiraIssue,
  type JiraTransition,
} from "./lib.ts";

const AGENT_DIR = ".agent";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}.`);
  }
  return value;
}

function jiraBaseUrl(): string {
  return requireEnv("JIRA_BASE_URL").replace(/\/+$/, "");
}

async function jira(path: string, init: { method?: string; body?: unknown } = {}): Promise<unknown> {
  const auth = Buffer.from(`${requireEnv("JIRA_EMAIL")}:${requireEnv("JIRA_API_TOKEN")}`).toString("base64");
  const response = await fetch(`${jiraBaseUrl()}/rest/api/2${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!response.ok) {
    throw new Error(`Jira ${init.method ?? "GET"} ${path} failed: ${response.status} ${await response.text()}`);
  }
  return response.status === 204 ? null : response.json();
}

async function getIssue(key: string): Promise<JiraIssue> {
  return parseIssueResponse(await jira(`/issue/${key}?fields=summary,description,issuetype,components,labels`));
}

async function comment(key: string, body: string): Promise<void> {
  await jira(`/issue/${key}/comment`, { method: "POST", body: { body } });
}

async function transition(key: string, statusName: string): Promise<void> {
  const json = await jira(`/issue/${key}/transitions`);
  const transitions = (json as { transitions?: JiraTransition[] }).transitions ?? [];
  const id = findTransitionId(transitions, statusName);
  if (!id) {
    console.warn(`No transition to "${statusName}" is available for ${key}; leaving status unchanged.`);
    return;
  }
  await jira(`/issue/${key}/transitions`, { method: "POST", body: { transition: { id } } });
}

async function addLabel(key: string, label: string): Promise<void> {
  await jira(`/issue/${key}`, { method: "PUT", body: { update: { labels: [{ add: label }] } } });
}

function setOutput(name: string, value: string): void {
  const file = process.env.GITHUB_OUTPUT;
  if (file) {
    appendFileSync(file, `${name}=${value}\n`);
  } else {
    console.log(`${name}=${value}`);
  }
}

function readAgentFile(name: string): string {
  const path = `${AGENT_DIR}/${name}`;
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

async function fetchCommand(key: string): Promise<void> {
  const issue = await getIssue(key);
  mkdirSync(AGENT_DIR, { recursive: true });
  const standards = standardsFiles(issue.components).filter((file) => existsSync(file));
  const markdown = [
    issueToMarkdown(issue),
    "## Standards to follow",
    "",
    ...(standards.length > 0 ? standards.map((file) => `- ${file}`) : ["- none found"]),
    "",
  ].join("\n");
  writeFileSync(`${AGENT_DIR}/issue.md`, markdown);
  writeFileSync(`${AGENT_DIR}/issue.json`, JSON.stringify(issue, null, 2));

  const problems = readinessProblems(issue);
  setOutput("key", issue.key);
  setOutput("branch", branchName(issue));
  setOutput("ready", problems.length === 0 ? "true" : "false");
  if (problems.length > 0) {
    await comment(key, notReadyComment(problems));
    console.log(`${key} is not ready:\n${problems.join("\n")}`);
  }
}

async function main(): Promise<void> {
  const [command, rawKey, ...args] = process.argv.slice(2);
  const key = parseIssueKey(rawKey ?? "", process.env.JIRA_PROJECT_KEY || "KAN");
  if (!command || !key) {
    throw new Error(`Usage: jira.ts <command> <issue-key>. Got an invalid issue key: "${rawKey ?? ""}".`);
  }

  switch (command) {
    case "fetch":
      await fetchCommand(key);
      return;
    case "start":
      await transition(key, "In Progress");
      await comment(key, startedComment(args[0] ?? ""));
      return;
    case "review":
      await comment(key, reviewComment(args[0] ?? "", readAgentFile("summary.md"), args[1] ?? ""));
      await transition(key, "In Review");
      return;
    case "fail":
      await addLabel(key, "agent-failed");
      await comment(key, failedComment(args[0] ?? ""));
      return;
    case "pr-body": {
      const issue = JSON.parse(readAgentFile("issue.json")) as JiraIssue;
      if (issue.key !== key) {
        throw new Error(`${AGENT_DIR}/issue.json is for ${issue.key}, not ${key}.`);
      }
      process.stdout.write(pullRequestBody(issue, jiraBaseUrl(), readAgentFile("plan.md"), readAgentFile("summary.md")));
      return;
    }
    default:
      throw new Error(`Unknown command "${command}".`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
