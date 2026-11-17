import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { HealthStatus } from "./health-status";
import { apiRequest } from "@/services/api-client";

vi.mock("@/services/api-client", () => ({
  apiRequest: vi.fn(),
  ApiRequestError: class ApiRequestError extends Error {},
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("HealthStatus", () => {
  it("shows a live successful response", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ status: "UP", application: "UniWork API", database: "UP" });
    render(<HealthStatus />);
    expect(await screen.findByText("API connected")).toBeInTheDocument();
    expect(screen.getByText("UniWork API and database are up.")).toBeInTheDocument();
  });

  it("shows the unavailable state when the API cannot be reached", async () => {
    vi.mocked(apiRequest).mockRejectedValue(new Error("offline"));
    render(<HealthStatus />);
    expect(await screen.findByText("API unavailable")).toBeInTheDocument();
  });
});
