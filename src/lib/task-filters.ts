import type { Prisma } from "@/generated/prisma/client";
import { isPriorityValue } from "./priority";

export type TaskSearchParams = {
  q?: string;
  priority?: string;
  label?: string;
  due?: string;
};

export function buildTaskWhere(
  base: Prisma.TaskWhereInput,
  params: TaskSearchParams
): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = { ...base };

  if (params.q) {
    where.title = { contains: params.q, mode: "insensitive" };
  }

  if (params.priority && isPriorityValue(params.priority)) {
    where.priority = params.priority;
  }

  if (params.label) {
    where.labels = { some: { labelId: params.label } };
  }

  if (params.due === "overdue") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    where.dueDate = { lt: todayStart };
    where.completed = false;
  } else if (params.due === "today") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    where.dueDate = { gte: todayStart, lt: todayEnd };
  } else if (params.due === "none") {
    where.dueDate = null;
  }

  return where;
}

export function hasActiveFilters(params: TaskSearchParams): boolean {
  return Boolean(params.q || params.priority || params.label || params.due);
}
