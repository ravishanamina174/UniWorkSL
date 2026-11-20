import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { DashboardShell } from "./dashboard-shell";

const route = vi.hoisted(() => ({ pathname: "/dashboard/applications" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("@clerk/nextjs", () => ({ UserButton: () => <span>Account</span> }));
vi.mock("@/components/theme/theme-toggle", () => ({ ThemeToggle: () => <button type="button">Theme</button> }));

afterEach(() => cleanup());

describe("Task Poster navigation", () => {
  it("keeps all destinations in the mobile row and the desktop sidebar", () => {
    render(<DashboardShell displayName="Poster"><p>Page content</p></DashboardShell>);
    const mobile = screen.getByRole("navigation", { name: "Mobile dashboard navigation" });
    const desktop = screen.getByRole("navigation", { name: "Dashboard navigation" });
    for (const label of ["Dashboard", "Posted Tasks", "Applications", "Student Lookup", "Profile"]) {
      expect(within(mobile).getByRole("link", { name: label })).toBeInTheDocument();
      expect(within(desktop).getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(within(mobile).getByRole("link", { name: "Applications" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("button", { name: /open dashboard navigation/i })).not.toBeInTheDocument();
  });

  it("marks nested task routes as Posted Tasks", () => {
    route.pathname = "/dashboard/tasks/example/start";
    render(<DashboardShell displayName="Poster"><p>Page content</p></DashboardShell>);
    expect(within(screen.getByRole("navigation", { name: "Mobile dashboard navigation" })).getByRole("link", { name: "Posted Tasks" })).toHaveAttribute("aria-current", "page");
    route.pathname = "/dashboard/applications";
  });
});
