import { describe, expect, it } from "vitest";
import { isValidCoordinatePair, parseRequiredSkills } from "./task-form-validation";

describe("task form validation", () => {
  it("normalizes and deduplicates comma-separated required skills", () => {
    expect(parseRequiredSkills(" Lifting, careful handling, Lifting ")).toEqual({ skills: ["Lifting", "careful handling"] });
  });

  it("requires between one and twenty non-empty skills and enforces the skill length", () => {
    expect(parseRequiredSkills(" , ").error).toMatch(/between 1 and 20/);
    expect(parseRequiredSkills(Array.from({ length: 21 }, (_, index) => `skill${index}`).join(",")).error).toMatch(/between 1 and 20/);
    expect(parseRequiredSkills("a".repeat(81)).error).toMatch(/80 characters/);
  });

  it("accepts coordinates inside the WGS84 range only", () => {
    expect(isValidCoordinatePair(6.9271, 79.8612)).toBe(true);
    expect(isValidCoordinatePair(-90, 180)).toBe(true);
    expect(isValidCoordinatePair(90.1, 0)).toBe(false);
    expect(isValidCoordinatePair(0, -180.1)).toBe(false);
    expect(isValidCoordinatePair(Number.NaN, 0)).toBe(false);
  });
});
