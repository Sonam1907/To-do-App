import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-border p-4">
        <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>

        <nav className="flex flex-col gap-1">
          <Link href="/" className="rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            Inbox
          </Link>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="truncate rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              {project.name}
            </Link>
          ))}
        </nav>

        <form action={createProject} className="flex gap-1">
          <Input name="name" placeholder="New project" className="h-7 text-xs" required />
          <Button type="submit" size="xs">
            +
          </Button>
        </form>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="mt-auto"
        >
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Log out
          </Button>
        </form>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
