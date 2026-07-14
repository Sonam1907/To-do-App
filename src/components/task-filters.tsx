import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PRIORITY_OPTIONS } from "@/lib/priority";
import { hasActiveFilters, type TaskSearchParams } from "@/lib/task-filters";

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none";

export function TaskFilters({
  basePath,
  searchParams,
  labels,
}: {
  basePath: string;
  searchParams: TaskSearchParams;
  labels: { id: string; name: string }[];
}) {
  return (
    <form
      method="get"
      key={JSON.stringify(searchParams)}
      className="flex flex-wrap items-center gap-2"
    >
      <Input
        name="q"
        placeholder="Search tasks..."
        defaultValue={searchParams.q ?? ""}
        className="max-w-48"
      />
      <select name="priority" defaultValue={searchParams.priority ?? ""} className={selectClass}>
        <option value="">Any priority</option>
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select name="label" defaultValue={searchParams.label ?? ""} className={selectClass}>
        <option value="">Any label</option>
        {labels.map((label) => (
          <option key={label.id} value={label.id}>
            {label.name}
          </option>
        ))}
      </select>
      <select name="due" defaultValue={searchParams.due ?? ""} className={selectClass}>
        <option value="">Any due date</option>
        <option value="overdue">Overdue</option>
        <option value="today">Due today</option>
        <option value="none">No due date</option>
      </select>
      <Button type="submit" variant="outline" size="sm">
        Filter
      </Button>
      {hasActiveFilters(searchParams) && (
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={basePath}>Clear</Link>}
        />
      )}
    </form>
  );
}
