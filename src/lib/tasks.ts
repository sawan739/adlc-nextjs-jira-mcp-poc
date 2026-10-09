export type Task = {
  id: string;
  title: string;
};

export type AddTaskResult =
  | { ok: true; tasks: Task[] }
  | { ok: false; error: string };

export const EMPTY_TITLE_ERROR = "Task title is required.";

export function validateTaskTitle(title: string): string | null {
  return title.trim() === "" ? EMPTY_TITLE_ERROR : null;
}

export function addTask(tasks: readonly Task[], title: string, id: string): AddTaskResult {
  const error = validateTaskTitle(title);
  if (error) {
    return { ok: false, error };
  }
  return { ok: true, tasks: [...tasks, { id, title: title.trim() }] };
}
