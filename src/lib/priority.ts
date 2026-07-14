export const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", dotClass: "bg-blue-500" },
  { value: "MEDIUM", label: "Medium", dotClass: "bg-yellow-500" },
  { value: "HIGH", label: "High", dotClass: "bg-orange-500" },
  { value: "URGENT", label: "Urgent", dotClass: "bg-red-500" },
] as const;

export type PriorityValue = (typeof PRIORITY_OPTIONS)[number]["value"];

export function isPriorityValue(value: string): value is PriorityValue {
  return PRIORITY_OPTIONS.some((option) => option.value === value);
}

export function priorityDotClass(priority: string): string {
  return PRIORITY_OPTIONS.find((option) => option.value === priority)?.dotClass ?? "bg-muted";
}

export function priorityLabel(priority: string): string {
  return PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? priority;
}
