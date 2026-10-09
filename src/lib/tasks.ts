export type Task = {
  id: string;
  title: string;
};

export type TaskListResult =
  | { ok: true; tasks: Task[] }
  | { ok: false; error: string };

export type AddTaskResult = TaskListResult;

export const EMPTY_TITLE_ERROR = "Task title is required.";
export const TASK_NOT_FOUND_ERROR = "Task not found.";

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

export function updateTask(tasks: readonly Task[], id: string, title: string): TaskListResult {
  const error = validateTaskTitle(title);
  if (error) {
    return { ok: false, error };
  }
  if (!tasks.some((task) => task.id === id)) {
    return { ok: false, error: TASK_NOT_FOUND_ERROR };
  }
  return {
    ok: true,
    tasks: tasks.map((task) => (task.id === id ? { ...task, title: title.trim() } : task)),
  };
}

export function deleteTask(tasks: readonly Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}
