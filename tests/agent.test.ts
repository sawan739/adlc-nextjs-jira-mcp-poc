import { describe, expect, it } from "vitest";
import {
  branchName,
  failedComment,
  findTransitionId,
  issueToMarkdown,
  MAX_COMMENT_SECTION_LENGTH,
  notReadyComment,
  parseIssueKey,
  parseIssueResponse,
  pullRequestBody,
  readinessProblems,
  reviewComment,
  slugify,
  standardsFiles,
  startedComment,
  type JiraIssue,
} from "../scripts/agent/lib";

function readyIssue(overrides: Partial<JiraIssue> = {}): JiraIssue {
  return {
    key: "KAN-12",
    summary: "Add task filters",
    description: "Filter tasks.\n\n*Acceptance Criteria*\n# Filters work",
    issueType: "Task",
    components: [],
    labels: [],
    ...overrides,
  };
}

describe("parseIssueKey", () => {
  it("accepts a valid key", () => {
    expect(parseIssueKey("KAN-12", "KAN")).toBe("KAN-12");
  });

  it("normalises case and whitespace", () => {
    expect(parseIssueKey("  kan-7 ", "KAN")).toBe("KAN-7");
  });

  it.each(["", "KAN", "KAN-", "KAN-0", "KAN-01", "OTHER-1", "KAN-1; rm -rf /", "KAN-1\nKAN-2", "$(id)"])(
    "rejects %j",
    (input) => {
      expect(parseIssueKey(input, "KAN")).toBeNull();
    },
  );

  it("treats the project key literally", () => {
    expect(parseIssueKey("AXB-1", "A.B")).toBeNull();
    expect(parseIssueKey("A.B-1", "A.B")).toBe("A.B-1");
  });
});

describe("parseIssueResponse", () => {
  it("extracts the fields the agent needs", () => {
    const issue = parseIssueResponse({
      key: "KAN-2",
      fields: {
        summary: "Edit tasks",
        description: "Desc",
        issuetype: { name: "Task" },
        components: [{ name: "Frontend" }, { name: "Testing" }],
        labels: ["ui"],
      },
    });
    expect(issue).toEqual({
      key: "KAN-2",
      summary: "Edit tasks",
      description: "Desc",
      issueType: "Task",
      components: ["Frontend", "Testing"],
      labels: ["ui"],
    });
  });

  it("defaults missing optional fields", () => {
    const issue = parseIssueResponse({ key: "KAN-3", fields: { summary: "S", description: null } });
    expect(issue).toMatchObject({ description: "", issueType: "", components: [], labels: [] });
  });

  it("throws on an unexpected response", () => {
    expect(() => parseIssueResponse({ errorMessages: ["nope"] })).toThrow("Unexpected Jira issue response.");
  });
});

describe("readinessProblems", () => {
  it("accepts a ticket with a description and acceptance criteria", () => {
    expect(readinessProblems(readyIssue())).toEqual([]);
  });

  it("requires a description", () => {
    expect(readinessProblems(readyIssue({ description: "  " }))).toEqual(["The ticket has no description."]);
  });

  it("requires an acceptance criteria section", () => {
    expect(readinessProblems(readyIssue({ description: "Just do it." }))).toEqual([
      'The description has no "Acceptance Criteria" section.',
    ]);
  });

  it("requires a summary", () => {
    expect(readinessProblems(readyIssue({ summary: "" }))).toContain("The ticket has no summary.");
  });

  it("skips epics and opted-out tickets", () => {
    expect(readinessProblems(readyIssue({ issueType: "Epic" }))).toHaveLength(1);
    expect(readinessProblems(readyIssue({ labels: ["no-agent"] }))).toEqual(['The ticket has the "no-agent" label.']);
  });
});

describe("slugify and branchName", () => {
  it("creates a safe slug", () => {
    expect(slugify("Edit, Update & Delete Tasks!")).toBe("edit-update-delete-tasks");
  });

  it("limits the slug length without a trailing dash", () => {
    const slug = slugify("a".repeat(39) + " bbbb");
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("falls back when nothing is left", () => {
    expect(slugify("!!!")).toBe("task");
  });

  it("builds a feature branch name", () => {
    expect(branchName({ key: "KAN-12", summary: "Agent pipeline: GitHub workflow" })).toBe(
      "feature/KAN-12-agent-pipeline-github-workflow",
    );
  });

  it("does not repeat the key when the summary starts with it", () => {
    expect(branchName({ key: "KAN-2", summary: "KAN-2 — Edit, Update, and Delete Tasks" })).toBe(
      "feature/KAN-2-edit-update-and-delete-tasks",
    );
  });
});

describe("standardsFiles", () => {
  it("always includes the general standard and maps components", () => {
    expect(standardsFiles(["Frontend", "Backend/API", "frontend"])).toEqual([
      "docs/standards/general.md",
      "docs/standards/frontend.md",
      "docs/standards/backend-api.md",
    ]);
  });
});

describe("findTransitionId", () => {
  const transitions = [
    { id: "21", name: "Start", to: { name: "In Progress" } },
    { id: "31", name: "Review", to: { name: "In Review" } },
  ];

  it("matches by target status, case-insensitively", () => {
    expect(findTransitionId(transitions, "in review")).toBe("31");
  });

  it("returns null when the status is unavailable", () => {
    expect(findTransitionId(transitions, "Done")).toBeNull();
  });
});

describe("comments and pull request body", () => {
  it("renders the issue as markdown", () => {
    const markdown = issueToMarkdown(readyIssue({ components: ["Frontend"] }));
    expect(markdown).toContain("# KAN-12: Add task filters");
    expect(markdown).toContain("- Components: Frontend");
    expect(markdown).toContain("*Acceptance Criteria*");
  });

  it("includes the run link when starting", () => {
    expect(startedComment("https://run/1")).toContain("https://run/1");
  });

  it("lists readiness problems", () => {
    expect(notReadyComment(["A", "B"])).toContain("* A\n* B");
  });

  it("shows the agent summary verbatim and links the PR", () => {
    const body = reviewComment("https://pr/1", "Did *things* {noformat}", "https://run/1");
    expect(body).toContain("Pull request: https://pr/1");
    expect(body).toContain("Workflow run: https://run/1");
    expect(body).toContain("{noformat}\nDid *things* { noformat }\n{noformat}");
  });

  it("truncates very long summaries", () => {
    const body = reviewComment("u", "x".repeat(MAX_COMMENT_SECTION_LENGTH + 100), "r");
    expect(body).toContain("… (truncated)");
    expect(body.length).toBeLessThan(MAX_COMMENT_SECTION_LENGTH + 1_000);
  });

  it("explains how to retry after a failure", () => {
    expect(failedComment("https://run/1")).toContain("agent-failed");
  });

  it("builds a pull request body with the Jira link", () => {
    const body = pullRequestBody(readyIssue(), "https://example.atlassian.net/", "The plan", "The summary");
    expect(body).toContain("[KAN-12](https://example.atlassian.net/browse/KAN-12)");
    expect(body).toContain("## Plan\nThe plan");
    expect(body).toContain("## Summary\nThe summary");
  });
});
