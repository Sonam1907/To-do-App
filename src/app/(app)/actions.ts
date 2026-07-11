"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function createTask(formData: FormData) {
  const userId = await requireUserId();
  const title = (formData.get("title") as string | null)?.trim();
  if (!title) return;

  const projectId = (formData.get("projectId") as string | null) || null;

  await prisma.task.create({
    data: { title, ownerId: userId, projectId },
  });

  revalidatePath("/", "layout");
}

export async function toggleTaskComplete(taskId: string, completed: boolean) {
  const userId = await requireUserId();

  await prisma.task.updateMany({
    where: { id: taskId, ownerId: userId },
    data: { completed },
  });

  revalidatePath("/", "layout");
}

export async function deleteTask(taskId: string) {
  const userId = await requireUserId();

  await prisma.task.deleteMany({
    where: { id: taskId, ownerId: userId },
  });

  revalidatePath("/", "layout");
}

export async function createProject(formData: FormData) {
  const userId = await requireUserId();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return;

  await prisma.project.create({
    data: { name, ownerId: userId },
  });

  revalidatePath("/", "layout");
}

export async function deleteProject(projectId: string) {
  const userId = await requireUserId();

  await prisma.project.deleteMany({
    where: { id: projectId, ownerId: userId },
  });

  revalidatePath("/", "layout");
  redirect("/");
}
