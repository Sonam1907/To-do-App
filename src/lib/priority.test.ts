import { describe, it, expect } from "vitest";
import { isPriorityValue, priorityDotClass, priorityLabel } from "./priority";

describe("isPriorityValue", () => {
  it("accepts each valid priority value", () => {
    expect(isPriorityValue("LOW")).toBe(true);
    expect(isPriorityValue("MEDIUM")).toBe(true);
    expect(isPriorityValue("HIGH")).toBe(true);
    expect(isPriorityValue("URGENT")).toBe(true);
  });

  it("rejects invalid values", () => {
    expect(isPriorityValue("")).toBe(false);
    expect(isPriorityValue("low")).toBe(false); // case-sensitive
    expect(isPriorityValue("CRITICAL")).toBe(false);
  });
});

describe("priorityDotClass", () => {
  it("returns the matching color class for a known priority", () => {
    expect(priorityDotClass("URGENT")).toBe("bg-red-500");
  });

  it("falls back to a neutral class for an unknown value", () => {
    expect(priorityDotClass("nonsense")).toBe("bg-muted");
  });
});

describe("priorityLabel", () => {
  it("returns the human-readable label for a known priority", () => {
    expect(priorityLabel("URGENT")).toBe("Urgent");
  });

  it("falls back to echoing the raw value for an unknown priority", () => {
    expect(priorityLabel("nonsense")).toBe("nonsense");
  });
});
