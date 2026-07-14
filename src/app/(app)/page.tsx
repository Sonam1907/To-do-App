import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/task-list";
import { TaskFilters } from "@/components/task-filters";
import { buildTaskWhere, type TaskSearchParams } from "@/lib/task-filters";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<TaskSearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;
  const params = await searchParams;

  const [tasks, labels] = await Promise.all([
    prisma.task.findMany({
      where: buildTaskWhere({ ownerId: userId, projectId: null, parentId: null }, params),
      orderBy: [{ completed: "asc" }, { createdAt: "asc" }],
      include: {
        labels: { include: { label: true } },
        subtasks: { orderBy: [{ completed: "asc" }, { createdAt: "asc" }] },
      },
    }),
    prisma.label.findMany({ where: { ownerId: userId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Inbox</h1>
      <TaskFilters basePath="/" searchParams={params} labels={labels} />
      <TaskList tasks={tasks} />
    </div>
  );
}
