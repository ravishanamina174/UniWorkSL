import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import AdminLayout from "./layout";

const clerk = vi.hoisted(() => ({ protect: vi.fn(), currentUser: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: { protect: clerk.protect }, currentUser: clerk.currentUser }));
vi.mock("@/components/dashboard/dashboard-access-state", () => ({ hasClerkConfiguration: () => true, DashboardConfigurationRequired: () => <p>Configuration required</p> }));
vi.mock("@/features/admin/admin-shell", () => ({ AdminShell: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-shell">{children}</div> }));
afterEach(() => { cleanup(); clerk.protect.mockReset(); clerk.currentUser.mockReset(); });

describe("restricted Admin layout", () => {
  it("does not render the workspace for an authenticated Task Poster", async () => {
    clerk.currentUser.mockResolvedValue({ firstName: "Poster", publicMetadata: { role: "Task Poster" } });
    render(await AdminLayout({ children: <p>Private Admin data</p> }));
    expect(screen.getByRole("heading", { name: "Access denied" })).toBeInTheDocument();
    expect(screen.queryByText("Private Admin data")).not.toBeInTheDocument();
    expect(clerk.protect).toHaveBeenCalledTimes(1);
  });

  it("renders the workspace for the exact Admin metadata role", async () => {
    clerk.currentUser.mockResolvedValue({ firstName: "Safety", publicMetadata: { role: "Admin" } });
    render(await AdminLayout({ children: <p>Private Admin data</p> }));
    expect(screen.getByTestId("admin-shell")).toContainElement(screen.getByText("Private Admin data"));
  });
});
