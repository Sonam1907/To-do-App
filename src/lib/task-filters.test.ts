import { describe, it, expect } from "vitest";
import { buildTaskWhere, hasActiveFilters } from "./task-filters";

const base = { ownerId: "user-1", projectId: null, parentId: null };

describe("buildTaskWhere", () => {
  it("returns just the base filter when no search params are given", () => {
    expect(buildTaskWhere(base, {})).toEqual(base);
  });

  it("adds a case-insensitive title search", () => {
    const where = buildTaskWhere(base, { q: "milk" });
    expect(where.title).toEqual({ contains: "milk", mode: "insensitive" });
  });

  it("adds a priority filter only for valid priority values", () => {
    expect(buildTaskWhere(base, { priority: "URGENT" }).priority).toBe("URGENT");
    // an invalid/garbage priority should be silently ignored, not passed through to Prisma
    expect(buildTaskWhere(base, { priority: "not-a-priority" }).priority).toBeUndefined();
  });

  it("adds a label filter via the join table", () => {
    const where = buildTaskWhere(base, { label: "label-123" });
    expect(where.labels).toEqual({ some: { labelId: "label-123" } });
  });

  it("filters overdue as: due before today AND not completed", () => {
    const where = buildTaskWhere(base, { due: "overdue" });
    expect(where.completed).toBe(false);
    expect(where.dueDate).toHaveProperty("lt");
  });

  it("filters 'today' as a range covering the whole day", () => {
    const where = buildTaskWhere(base, { due: "today" });
    const range = where.dueDate as { gte: Date; lt: Date };
    const spanMs = range.lt.getTime() - range.gte.getTime();
    expect(spanMs).toBe(24 * 60 * 60 * 1000);
  });

  it("filters 'none' as dueDate IS NULL", () => {
    const where = buildTaskWhere(base, { due: "none" });
    expect(where.dueDate).toBeNull();
  });

  it("ignores an unrecognized due-date bucket", () => {
    const where = buildTaskWhere(base, { due: "whenever" });
    expect(where.dueDate).toBeUndefined();
  });

  it("combines multiple filters at once", () => {
    const where = buildTaskWhere(base, { q: "report", priority: "HIGH", label: "work" });
    expect(where.title).toEqual({ contains: "report", mode: "insensitive" });
    expect(where.priority).toBe("HIGH");
    expect(where.labels).toEqual({ some: { labelId: "work" } });
  });
});

describe("hasActiveFilters", () => {
  it("is false when nothing is set", () => {
    expect(hasActiveFilters({})).toBe(false);
  });

  it("is true if any single filter is set", () => {
    expect(hasActiveFilters({ q: "x" })).toBe(true);
    expect(hasActiveFilters({ priority: "LOW" })).toBe(true);
    expect(hasActiveFilters({ label: "x" })).toBe(true);
    expect(hasActiveFilters({ due: "today" })).toBe(true);
  });
});
