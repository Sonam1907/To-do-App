"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_OPTIONS, priorityLabel } from "@/lib/priority";

export function PrioritySelectField() {
  return (
    <Select name="priority" defaultValue="MEDIUM">
      <SelectTrigger size="sm">
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
