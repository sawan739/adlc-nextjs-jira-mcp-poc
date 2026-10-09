"use client";

import { useRef, useState, type FormEvent } from "react";
import { addTask, type Task } from "@/lib/tasks";

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
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
          {tasks.map((task) => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
