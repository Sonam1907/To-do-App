"use server";

import { revalidatePath } from "next/cache";
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

  await prisma.task.create({
    data: { title, ownerId: userId },
  });

  revalidatePath("/");
}

export async function toggleTaskComplete(taskId: string, completed: boolean) {
  const userId = await requireUserId();

  await prisma.task.updateMany({
    where: { id: taskId, ownerId: userId },
    data: { completed },
  });

  revalidatePath("/");
}

export async function deleteTask(taskId: string) {
  const userId = await requireUserId();

  await prisma.task.deleteMany({
    where: { id: taskId, ownerId: userId },
  });

  revalidatePath("/");
}
