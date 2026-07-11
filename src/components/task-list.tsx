import type { Task } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCheckbox } from "@/components/task-checkbox";
import { createTask, deleteTask } from "@/app/(app)/actions";

export function TaskList({ tasks, projectId }: { tasks: Task[]; projectId?: string }) {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <form action={createTask} className="flex gap-2">
        {projectId && <input type="hidden" name="projectId" value={projectId} />}
        <Input name="title" placeholder="Add a task..." required />
        <Button type="submit">Add</Button>
      </form>

      <ul className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks yet — add one above.</p>
        )}
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
          >
            <TaskCheckbox taskId={task.id} defaultChecked={task.completed} />
            <span
              className={
                task.completed ? "flex-1 text-muted-foreground line-through" : "flex-1"
              }
            >
              {task.title}
            </span>
            <form action={deleteTask.bind(null, task.id)}>
              <Button type="submit" variant="ghost" size="sm">
                Delete
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
