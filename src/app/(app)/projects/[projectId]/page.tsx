import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/task-list";
import { Button } from "@/components/ui/button";
import { deleteProject } from "../../actions";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;
  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });

  if (!project) {
    notFound();
  }

  const tasks = await prisma.task.findMany({
    where: { ownerId: userId, projectId, parentId: null },
    orderBy: [{ completed: "asc" }, { createdAt: "asc" }],
    include: {
      labels: { include: { label: true } },
      subtasks: { orderBy: [{ completed: "asc" }, { createdAt: "asc" }] },
    },
  });

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
      <TaskList tasks={tasks} projectId={project.id} />
    </div>
  );
}
