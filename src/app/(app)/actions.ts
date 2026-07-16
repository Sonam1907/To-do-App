"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPriorityValue } from "@/lib/priority";

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

function parseLabelNames(raw: string | null): string[] {
  if (!raw) return [];
  const names = raw
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
  return Array.from(new Set(names));
}

export async function createTask(formData: FormData) {
  const userId = await requireUserId();
  const title = (formData.get("title") as string | null)?.trim();
  if (!title) return;

  const projectId = (formData.get("projectId") as string | null) || null;

  const rawPriority = formData.get("priority") as string | null;
  const priority = rawPriority && isPriorityValue(rawPriority) ? rawPriority : "MEDIUM";

  const labelNames = parseLabelNames(formData.get("labels") as string | null);

  const rawDueDate = formData.get("dueDate") as string | null;
  const dueDate = rawDueDate ? new Date(rawDueDate) : null;

  const task = await prisma.task.create({
    data: { title, ownerId: userId, projectId, priority, dueDate },
  });

  for (const name of labelNames) {
    const label = await prisma.label.upsert({
      where: { ownerId_name: { ownerId: userId, name } },
      update: {},
      create: { ownerId: userId, name },
    });
    await prisma.taskLabel.create({
      data: { taskId: task.id, labelId: label.id },
    });
  }

  revalidatePath("/", "layout");
}

export async function setTaskPriority(taskId: string, priority: string) {
  const userId = await requireUserId();
  if (!isPriorityValue(priority)) return;

  await prisma.task.updateMany({
    where: { id: taskId, ownerId: userId },
    data: { priority },
  });

  revalidatePath("/", "layout");
}

export async function setTaskDueDate(taskId: string, dueDate: string | null) {
  const userId = await requireUserId();

  await prisma.task.updateMany({
    where: { id: taskId, ownerId: userId },
    data: { dueDate: dueDate ? new Date(dueDate) : null },
  });

  revalidatePath("/", "layout");
}

export async function createSubtask(formData: FormData) {
  const userId = await requireUserId();
  const title = (formData.get("title") as string | null)?.trim();
  const parentId = formData.get("parentId") as string | null;
  if (!title || !parentId) return;

  const parent = await prisma.task.findFirst({
    where: { id: parentId, ownerId: userId },
  });
  if (!parent) return;

  await prisma.task.create({
    data: {
      title,
      ownerId: userId,
      projectId: parent.projectId,
      parentId: parent.id,
    },
  });

  revalidatePath("/", "layout");
}

export async function createReminder(formData: FormData) {
  const userId = await requireUserId();
  const taskId = formData.get("taskId") as string | null;
  const remindAtRaw = formData.get("remindAt") as string | null;
  if (!taskId || !remindAtRaw) return;

  const task = await prisma.task.findFirst({
    where: { id: taskId, ownerId: userId },
  });
  if (!task) return;

  await prisma.reminder.create({
    data: { taskId: task.id, remindAt: new Date(remindAtRaw) },
  });

  revalidatePath("/", "layout");
}

export async function deleteReminder(reminderId: string) {
  const userId = await requireUserId();

  await prisma.reminder.deleteMany({
    where: { id: reminderId, task: { ownerId: userId } },
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
