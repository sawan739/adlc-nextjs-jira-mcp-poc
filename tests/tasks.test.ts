import { describe, expect, it } from "vitest";
import { addTask, EMPTY_TITLE_ERROR, validateTaskTitle, type Task } from "../src/lib/tasks";

describe("validateTaskTitle", () => {
  it("accepts a non-empty title", () => {
    expect(validateTaskTitle("Buy milk")).toBeNull();
  });

  it("rejects an empty title", () => {
    expect(validateTaskTitle("")).toBe(EMPTY_TITLE_ERROR);
  });

  it("rejects a whitespace-only title", () => {
    expect(validateTaskTitle("  \t\n ")).toBe(EMPTY_TITLE_ERROR);
  });
});

describe("addTask", () => {
  it("adds a valid task", () => {
    const result = addTask([], "Buy milk", "1");
    expect(result).toEqual({ ok: true, tasks: [{ id: "1", title: "Buy milk" }] });
  });

  it("trims the task title", () => {
    const result = addTask([], "  Buy milk  ", "1");
    expect(result.ok && result.tasks[0].title).toBe("Buy milk");
  });

  it("does not add an empty task", () => {
    const tasks: Task[] = [{ id: "1", title: "Existing" }];
    expect(addTask(tasks, "   ", "2")).toEqual({ ok: false, error: EMPTY_TITLE_ERROR });
    expect(tasks).toHaveLength(1);
  });

  it("does not mutate the original list", () => {
    const tasks: Task[] = [{ id: "1", title: "Existing" }];
    const result = addTask(tasks, "New", "2");
    expect(tasks).toEqual([{ id: "1", title: "Existing" }]);
    expect(result.ok && result.tasks).not.toBe(tasks);
  });

  it("appends tasks in order", () => {
    const first = addTask([], "First", "1");
    if (!first.ok) throw new Error("expected first task to be added");
    const second = addTask(first.tasks, "Second", "2");
    expect(second.ok && second.tasks.map((task) => task.title)).toEqual(["First", "Second"]);
  });
});
