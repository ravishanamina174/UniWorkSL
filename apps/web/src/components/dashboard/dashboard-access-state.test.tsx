import { describe, expect, it } from "vitest";
import { hasTaskPosterRole } from "./dashboard-access-state";

describe("dashboard role guard", () => {
  it("only accepts the server-controlled task_poster role", () => {
    expect(hasTaskPosterRole({ role: "task_poster" })).toBe(true);
    expect(hasTaskPosterRole({ role: "student" })).toBe(false);
    expect(hasTaskPosterRole({})).toBe(false);
    expect(hasTaskPosterRole(undefined)).toBe(false);
  });
});
