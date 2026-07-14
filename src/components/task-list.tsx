import type { Prisma } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCheckbox } from "@/components/task-checkbox";
import { TaskPrioritySelect } from "@/components/task-priority-select";
import { PrioritySelectField } from "@/components/priority-select-field";
import { createTask, deleteTask } from "@/app/(app)/actions";

type TaskWithLabels = Prisma.TaskGetPayload<{
  include: { labels: { include: { label: true } } };
}>;

export function TaskList({
  tasks,
  projectId,
}: {
  tasks: TaskWithLabels[];
  projectId?: string;
}) {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <form action={createTask} className="flex flex-col gap-2">
        {projectId && <input type="hidden" name="projectId" value={projectId} />}
        <div className="flex gap-2">
          <Input name="title" placeholder="Add a task..." required />
          <PrioritySelectField />
          <Button type="submit">Add</Button>
        </div>
        <Input name="labels" placeholder="Labels (comma separated, optional)" />
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
            <div className="flex flex-1 flex-col gap-1">
              <span
                className={task.completed ? "text-muted-foreground line-through" : undefined}
              >
                {task.title}
              </span>
              {task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.labels.map(({ label }) => (
                    <span
                      key={label.id}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <TaskPrioritySelect taskId={task.id} defaultValue={task.priority} />
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
