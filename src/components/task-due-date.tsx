"use client";

import { useTransition } from "react";
import { setTaskDueDate } from "@/app/(app)/actions";

export function TaskDueDate({
  taskId,
  defaultValue,
}: {
  taskId: string;
  defaultValue: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="date"
      defaultValue={defaultValue}
      disabled={isPending}
      className="h-7 rounded-md border border-input bg-transparent px-1.5 text-xs outline-none disabled:opacity-50"
      onChange={(e) => {
        const value = e.target.value || null;
        startTransition(async () => {
          await setTaskDueDate(taskId, value);
        });
      }}
    />
  );
}
