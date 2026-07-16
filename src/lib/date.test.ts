import { describe, it, expect } from "vitest";
import { toDateInputValue, formatDueDate, isOverdue } from "./date";

describe("toDateInputValue", () => {
  it("returns an empty string for null", () => {
    expect(toDateInputValue(null)).toBe("");
  });

  it("formats a date as YYYY-MM-DD", () => {
    expect(toDateInputValue(new Date("2026-07-20T00:00:00.000Z"))).toBe("2026-07-20");
  });
});

describe("formatDueDate", () => {
  it("returns null for null", () => {
    expect(formatDueDate(null)).toBeNull();
  });

  it("formats a date as short month + day", () => {
    expect(formatDueDate(new Date("2026-07-20T00:00:00.000Z"))).toMatch(/Jul/);
  });
});

describe("isOverdue", () => {
  it("is false when there is no due date", () => {
    expect(isOverdue(null, false)).toBe(false);
  });

  it("is false when the task is already completed, even if the date is past", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isOverdue(yesterday, true)).toBe(false);
  });

  it("is true for a past due date on an incomplete task", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isOverdue(yesterday, false)).toBe(true);
  });

  it("is false for today's date (not yet overdue)", () => {
    const now = new Date();
    expect(isOverdue(now, false)).toBe(false);
  });

  it("is false for a future due date", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isOverdue(tomorrow, false)).toBe(false);
  });
});
