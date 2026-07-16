import type { Prisma } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCheckbox } from "@/components/task-checkbox";
import { TaskPrioritySelect } from "@/components/task-priority-select";
import { PrioritySelectField } from "@/components/priority-select-field";
import { TaskDueDate } from "@/components/task-due-date";
import { formatDueDate, formatDateTime, isOverdue, toDateInputValue } from "@/lib/date";
import {
  createTask,
  createSubtask,
  createReminder,
  deleteReminder,
  deleteTask,
} from "@/app/(app)/actions";

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    labels: { include: { label: true } };
    subtasks: true;
    reminders: true;
  };
}>;

export function TaskList({
  tasks,
  projectId,
}: {
  tasks: TaskWithRelations[];
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
        <div className="flex gap-2">
          <Input name="labels" placeholder="Labels (comma separated, optional)" />
          <Input name="dueDate" type="date" className="w-40" />
        </div>
      </form>

      <ul className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks yet — add one above.</p>
        )}
        {tasks.map((task) => {
          const dueDateText = formatDueDate(task.dueDate);
          const overdue = isOverdue(task.dueDate, task.completed);

          return (
            <li key={task.id} className="rounded-lg border border-border px-3 py-2">
              <div className="flex items-center gap-3">
                <TaskCheckbox taskId={task.id} defaultChecked={task.completed} />
                <div className="flex flex-1 flex-col gap-1">
                  <span
                    className={
                      task.completed ? "text-muted-foreground line-through" : undefined
                    }
                  >
                    {task.title}
                  </span>
                  {(task.labels.length > 0 || dueDateText) && (
                    <div className="flex flex-wrap items-center gap-1">
                      {task.labels.map(({ label }) => (
                        <span
                          key={label.id}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {label.name}
                        </span>
                      ))}
                      {dueDateText && (
                        <span
                          className={
                            overdue
                              ? "text-xs text-destructive"
                              : "text-xs text-muted-foreground"
                          }
                        >
                          Due {dueDateText}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <TaskDueDate taskId={task.id} defaultValue={toDateInputValue(task.dueDate)} />
                <TaskPrioritySelect taskId={task.id} defaultValue={task.priority} />
                <form action={deleteTask.bind(null, task.id)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Delete
                  </Button>
                </form>
              </div>

              <div className="mt-2 ml-7 flex flex-col gap-1.5 border-l border-border pl-3">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <TaskCheckbox taskId={subtask.id} defaultChecked={subtask.completed} />
                    <span
                      className={
                        subtask.completed
                          ? "flex-1 text-sm text-muted-foreground line-through"
                          : "flex-1 text-sm"
                      }
                    >
                      {subtask.title}
                    </span>
                    <form action={deleteTask.bind(null, subtask.id)}>
                      <Button type="submit" variant="ghost" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                ))}
                <form action={createSubtask} className="flex gap-2">
                  <input type="hidden" name="parentId" value={task.id} />
                  <Input name="title" placeholder="Add subtask..." className="h-7 text-sm" />
                  <Button type="submit" variant="ghost" size="sm">
                    Add
                  </Button>
                </form>

                {task.reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 text-muted-foreground">
                      🔔 Remind at {formatDateTime(reminder.remindAt)}
                      {reminder.sent && " (sent)"}
                    </span>
                    <form action={deleteReminder.bind(null, reminder.id)}>
                      <Button type="submit" variant="ghost" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                ))}
                <form action={createReminder} className="flex gap-2">
                  <input type="hidden" name="taskId" value={task.id} />
                  <Input
                    name="remindAt"
                    type="datetime-local"
                    className="h-7 flex-1 text-sm"
                    required
                  />
                  <Button type="submit" variant="ghost" size="sm">
                    Remind me
                  </Button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
