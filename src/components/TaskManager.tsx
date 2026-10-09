"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { addTask, deleteTask, updateTask, type Task } from "@/lib/tasks";

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const nextId = useRef(1);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = addTask(tasks, title, String(nextId.current));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    nextId.current += 1;
    setTasks(result.tasks);
    setTitle("");
    setError(null);
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditError(null);
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const result = updateTask(tasks, id, editTitle);
    if (!result.ok) {
      setEditError(result.error);
      return;
    }
    setTasks(result.tasks);
    cancelEdit();
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      cancelEdit();
    }
  }

  function handleDelete(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return;
    }
    setTasks(deleteTask(tasks, task.id));
    if (editingId === task.id) {
      cancelEdit();
    }
  }

  return (
    <section className="task-manager">
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="task-title">Task title</label>
        <div className="task-form-row">
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Buy milk"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "task-error" : undefined}
          />
          <button type="submit">Add</button>
        </div>
        {error && (
          <p id="task-error" className="task-error" role="alert">
            {error}
          </p>
        )}
      </form>

      {tasks.length === 0 ? (
        <p className="task-empty">No tasks yet.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) =>
            task.id === editingId ? (
              <li key={task.id}>
                <form
                  className="task-edit-form"
                  onSubmit={(event) => handleEditSubmit(event, task.id)}
                  noValidate
                >
                  <label htmlFor={`edit-task-${task.id}`} className="visually-hidden">
                    Edit task title
                  </label>
                  <div className="task-form-row">
                    <input
                      id={`edit-task-${task.id}`}
                      type="text"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      onKeyDown={handleEditKeyDown}
                      autoFocus
                      aria-invalid={editError ? true : undefined}
                      aria-describedby={editError ? `edit-task-error-${task.id}` : undefined}
                    />
                    <button type="submit">Save</button>
                    <button type="button" className="secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                  {editError && (
                    <p id={`edit-task-error-${task.id}`} className="task-error" role="alert">
                      {editError}
                    </p>
                  )}
                </form>
              </li>
            ) : (
              <li key={task.id} className="task-item">
                <span className="task-title">{task.title}</span>
                <div className="task-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => startEdit(task)}
                    aria-label={`Edit "${task.title}"`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(task)}
                    aria-label={`Delete "${task.title}"`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
