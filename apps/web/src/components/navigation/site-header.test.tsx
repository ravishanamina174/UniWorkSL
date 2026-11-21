import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteHeader } from "./site-header";

const clerk = vi.hoisted(() => ({ role: null as string | null, loaded: true }));
vi.mock("@clerk/nextjs", () => ({ useUser: () => ({ isLoaded: clerk.loaded, user: clerk.role ? { publicMetadata: { role: clerk.role } } : null }) }));

afterEach(() => { cleanup(); clerk.role = null; clerk.loaded = true; });

describe("site navigation", () => {
  it("opens the mobile menu and closes it after choosing a section", () => {
    render(<ThemeProvider><SiteHeader /></ThemeProvider>);
    const openButton = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(openButton);
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole("navigation", { name: "Mobile navigation" })).getByRole("link", { name: /why uniwork/i }));
    expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).not.toBeInTheDocument();
  });

  it("closes the mobile menu when Escape is pressed", () => {
    render(<ThemeProvider><SiteHeader /></ThemeProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).not.toBeInTheDocument();
  });

  it("switches to dark mode and persists the selected theme", async () => {
    render(<ThemeProvider><SiteHeader /></ThemeProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Toggle light and dark theme" }));
    await waitFor(() => expect(document.documentElement).toHaveClass("dark"));
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });

  it("shows the Admin action only for the exact current Clerk role", () => {
    clerk.loaded = false;
    const view = render(<ThemeProvider><SiteHeader /></ThemeProvider>);
    expect(screen.queryByRole("link", { name: /post a task|open admin workspace/i })).not.toBeInTheDocument();
    clerk.loaded = true;
    view.rerender(<ThemeProvider><SiteHeader /></ThemeProvider>);
    expect(screen.getByRole("link", { name: /post a task/i })).toHaveAttribute("href", "/dashboard");
    clerk.role = "TASK_POSTER";
    view.rerender(<ThemeProvider><SiteHeader /></ThemeProvider>);
    expect(screen.getByRole("link", { name: /post a task/i })).toHaveAttribute("href", "/dashboard");
    clerk.role = "Admin";
    view.rerender(<ThemeProvider><SiteHeader /></ThemeProvider>);
    expect(screen.getByRole("link", { name: /open admin workspace/i })).toHaveAttribute("href", "/admin/dashboard");
    clerk.role = null;
    view.rerender(<ThemeProvider><SiteHeader /></ThemeProvider>);
    expect(screen.queryByRole("link", { name: /open admin workspace/i })).not.toBeInTheDocument();
  });
});
