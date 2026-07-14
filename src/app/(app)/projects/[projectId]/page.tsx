import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/task-list";
import { TaskFilters } from "@/components/task-filters";
import { Button } from "@/components/ui/button";
import { buildTaskWhere, type TaskSearchParams } from "@/lib/task-filters";
import { deleteProject } from "../../actions";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<TaskSearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;
  const { projectId } = await params;
  const searchParamsResolved = await searchParams;

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });

  if (!project) {
    notFound();
  }

  const [tasks, labels] = await Promise.all([
    prisma.task.findMany({
      where: buildTaskWhere({ ownerId: userId, projectId, parentId: null }, searchParamsResolved),
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{project.name}</h1>
        <form action={deleteProject.bind(null, project.id)}>
          <Button type="submit" variant="outline" size="sm">
            Delete project
          </Button>
        </form>
      </div>
      <TaskFilters
        basePath={`/projects/${project.id}`}
        searchParams={searchParamsResolved}
        labels={labels}
      />
      <TaskList tasks={tasks} projectId={project.id} />
    </div>
  );
}
