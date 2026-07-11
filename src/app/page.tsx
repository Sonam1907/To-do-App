import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCheckbox } from "@/components/task-checkbox";
import { createTask, deleteTask } from "./actions";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p>You are not signed in.</p>
        <div className="flex gap-3">
          <Button nativeButton={false} render={<Link href="/login">Log in</Link>} />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/signup">Sign up</Link>}
          />
        </div>
      </div>
    );
  }

  const tasks = await prisma.task.findMany({
    where: { ownerId: session.user.id },
    orderBy: [{ completed: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{session.user.email}</p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </div>

      <form action={createTask} className="flex gap-2">
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
