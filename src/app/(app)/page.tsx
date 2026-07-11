import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/task-list";

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const tasks = await prisma.task.findMany({
    where: { ownerId: userId, projectId: null },
    orderBy: [{ completed: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Inbox</h1>
      <TaskList tasks={tasks} />
    </div>
  );
}
