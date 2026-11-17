import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DashboardConfigurationRequired } from "./dashboard-access-state";

afterEach(() => cleanup());

describe("dashboard configuration state", () => {
  it("explains why access remains unavailable without Clerk keys", () => {
    render(<DashboardConfigurationRequired />);
    expect(screen.getByRole("heading", { name: /dashboard access is not configured yet/i })).toBeInTheDocument();
    expect(screen.getByText(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/)).toBeInTheDocument();
  });
});
