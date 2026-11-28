import { describe, expect, it } from "vitest";
import { prepareQuote } from "./quote-payload";

describe("direct task quote payload", () => {
  it("rounds map coordinates to the backend's six decimal places", () => {
    const result = prepareQuote("student-id", "MOVING_PACKING", {
      description: "  Help move boxes  ", scheduledAt: "2026-12-01T14:30", amountLkr: "2500", locationAddress: "  Colombo  ",
    }, { latitude: 6.927078234234, longitude: 79.861243123124 });
    expect(result.errors).toEqual({});
    expect(result.payload).toMatchObject({ latitude: 6.927078, longitude: 79.861243, amountLkr: 2500, description: "Help move boxes", locationAddress: "Colombo" });
    expect(result.payload?.scheduledAt).toBe(new Date("2026-12-01T14:30").toISOString());
  });

  it("identifies invalid fields before submitting", () => {
    const result = prepareQuote("student-id", "MOVING_PACKING", {
      description: " ", scheduledAt: "invalid", amountLkr: "0", locationAddress: " ",
    }, null);
    expect(Object.keys(result.errors).sort()).toEqual(["amountLkr", "description", "location", "locationAddress", "scheduledAt"]);
    expect(result.payload).toBeNull();
  });

  it("rejects budgets that exceed the database's two-decimal amount", () => {
    const result = prepareQuote("student-id", "MOVING_PACKING", {
      description: "Help move boxes", scheduledAt: "2026-12-01T14:30", amountLkr: "2500.123", locationAddress: "Colombo",
    }, { latitude: 6.927078, longitude: 79.861243 });
    expect(result.errors.amountLkr).toMatch(/two decimal places/);
  });
});
