import { describe, expect, it } from "vitest";
import { hasClerkConfiguration } from "./clerk-config";

describe("hasClerkConfiguration", () => {
  it("keeps protected routes unavailable unless both Clerk keys exist", () => {
    expect(hasClerkConfiguration({})).toBe(false);
    expect(hasClerkConfiguration({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_demo" })).toBe(false);
    expect(hasClerkConfiguration({ CLERK_SECRET_KEY: "sk_test_demo" })).toBe(false);
    expect(hasClerkConfiguration({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_demo", CLERK_SECRET_KEY: "sk_test_demo" })).toBe(true);
  });
});
