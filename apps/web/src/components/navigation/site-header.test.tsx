import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteHeader } from "./site-header";

afterEach(() => { cleanup(); });

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
});
