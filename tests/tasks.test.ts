import { describe, expect, it } from "vitest";
import {
  addTask,
  deleteTask,
  EMPTY_TITLE_ERROR,
  TASK_NOT_FOUND_ERROR,
  updateTask,
  validateTaskTitle,
  type Task,
} from "../src/lib/tasks";

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

function sampleTasks(): Task[] {
  return [
    { id: "1", title: "First" },
    { id: "2", title: "Second" },
    { id: "3", title: "Third" },
  ];
}

describe("updateTask", () => {
  it("updates the title of the matching task", () => {
    const result = updateTask(sampleTasks(), "2", "Updated");
    expect(result).toEqual({
      ok: true,
      tasks: [
        { id: "1", title: "First" },
        { id: "2", title: "Updated" },
        { id: "3", title: "Third" },
      ],
    });
  });

  it("trims the updated title", () => {
    const result = updateTask(sampleTasks(), "1", "  Trimmed  ");
    expect(result.ok && result.tasks[0].title).toBe("Trimmed");
  });

  it("rejects an empty title", () => {
    const tasks = sampleTasks();
    expect(updateTask(tasks, "1", "")).toEqual({ ok: false, error: EMPTY_TITLE_ERROR });
    expect(tasks).toEqual(sampleTasks());
  });

  it("rejects a whitespace-only title", () => {
    expect(updateTask(sampleTasks(), "1", "  \t ")).toEqual({ ok: false, error: EMPTY_TITLE_ERROR });
  });

  it("returns an error for an unknown id", () => {
    expect(updateTask(sampleTasks(), "missing", "Title")).toEqual({
      ok: false,
      error: TASK_NOT_FOUND_ERROR,
    });
  });

  it("does not mutate the original list or task", () => {
    const tasks = sampleTasks();
    const original = tasks[1];
    const result = updateTask(tasks, "2", "Updated");
    expect(tasks).toEqual(sampleTasks());
    expect(original.title).toBe("Second");
    expect(result.ok && result.tasks).not.toBe(tasks);
  });

  it("leaves other tasks unchanged", () => {
    const tasks = sampleTasks();
    const result = updateTask(tasks, "2", "Updated");
    if (!result.ok) throw new Error("expected update to succeed");
    expect(result.tasks[0]).toBe(tasks[0]);
    expect(result.tasks[2]).toBe(tasks[2]);
    expect(result.tasks.map((task) => task.id)).toEqual(["1", "2", "3"]);
  });
});

describe("deleteTask", () => {
  it("removes only the matching task and keeps order", () => {
    expect(deleteTask(sampleTasks(), "2")).toEqual([
      { id: "1", title: "First" },
      { id: "3", title: "Third" },
    ]);
  });

  it("keeps other task objects unchanged", () => {
    const tasks = sampleTasks();
    const result = deleteTask(tasks, "1");
    expect(result[0]).toBe(tasks[1]);
    expect(result[1]).toBe(tasks[2]);
  });

  it("leaves the list unchanged for an unknown id", () => {
    expect(deleteTask(sampleTasks(), "missing")).toEqual(sampleTasks());
  });

  it("does not mutate the original list", () => {
    const tasks = sampleTasks();
    const result = deleteTask(tasks, "1");
    expect(tasks).toEqual(sampleTasks());
    expect(result).not.toBe(tasks);
  });

  it("returns an empty list when the last task is deleted", () => {
    expect(deleteTask([{ id: "1", title: "Only" }], "1")).toEqual([]);
  });
});

describe("task lifecycle", () => {
  it("supports add, update and delete together", () => {
    const first = addTask([], "First", "1");
    if (!first.ok) throw new Error("expected first task to be added");
    const second = addTask(first.tasks, "Second", "2");
    if (!second.ok) throw new Error("expected second task to be added");
    const updated = updateTask(second.tasks, "1", "First (edited)");
    if (!updated.ok) throw new Error("expected update to succeed");
    expect(deleteTask(updated.tasks, "2")).toEqual([{ id: "1", title: "First (edited)" }]);
  });
});
