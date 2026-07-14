"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIORITY_OPTIONS,
  priorityDotClass,
  priorityLabel,
  type PriorityValue,
} from "@/lib/priority";
import { setTaskPriority } from "@/app/(app)/actions";

export function TaskPrioritySelect({
  taskId,
  defaultValue,
}: {
  taskId: string;
  defaultValue: string;
}) {
  const [priority, setPriority] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={priority}
      disabled={isPending}
      onValueChange={(value) => {
        const next = value as PriorityValue;
        setPriority(next);
        startTransition(async () => {
          await setTaskPriority(taskId, next);
        });
      }}
    >
      <SelectTrigger size="sm">
        <span className={`size-2 rounded-full ${priorityDotClass(priority)}`} />
        <SelectValue>{(value: string) => priorityLabel(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PRIORITY_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className={`size-2 rounded-full ${option.dotClass}`} />
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
