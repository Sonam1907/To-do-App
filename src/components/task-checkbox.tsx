"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTaskComplete } from "@/app/(app)/actions";

export function TaskCheckbox({
  taskId,
  defaultChecked,
}: {
  taskId: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  const [isPending, startTransition] = useTransition();

  return (
    <Checkbox
      checked={checked}
      disabled={isPending}
      onCheckedChange={(next) => {
        setChecked(next);
        startTransition(async () => {
          await toggleTaskComplete(taskId, next);
        });
      }}
    />
  );
}
