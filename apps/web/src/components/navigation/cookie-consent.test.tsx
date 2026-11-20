import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { CookieConsent, CookieSettingsButton } from "./cookie-consent";

beforeEach(() => { const section = document.createElement("section"); section.id = "how-it-works"; document.body.appendChild(section); });
afterEach(() => { cleanup(); document.getElementById("how-it-works")?.remove(); window.localStorage.clear(); window.sessionStorage.clear(); });

describe("cookie preferences", () => {
  it("appears only when scrolling to How It Works", async () => {
    const section = document.getElementById("how-it-works")!;
    let top = window.innerHeight + 200;
    const measured = vi.spyOn(section, "getBoundingClientRect").mockImplementation(() => ({ top } as DOMRect));
    render(<CookieConsent />);
    await waitFor(() => expect(measured).toHaveBeenCalled());
    expect(screen.queryByRole("region", { name: "Cookie preferences" })).not.toBeInTheDocument();
    top = 100;
    fireEvent.scroll(window);
    expect(screen.getByRole("region", { name: "Cookie preferences" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close cookie notice" })).toBeInTheDocument();
  });

  it("dismisses without recording consent and reopens from the footer", async () => {
    render(<><CookieConsent /><CookieSettingsButton /></>);
    await waitFor(() => expect(screen.getByRole("button", { name: "Close cookie notice" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Close cookie notice" }));
    expect(window.localStorage.getItem("uniworksl:cookie-consent:v1")).toBeNull();
    expect(window.sessionStorage.getItem("uniworksl:cookie-dismissed:v1")).toBe("yes");
    fireEvent.click(screen.getByRole("button", { name: "Cookie settings" }));
    expect(screen.getByRole("region", { name: "Cookie preferences" })).toHaveAttribute("data-visible", "true");
  });

  it.each([
    ["Accept Cookies", "accepted"],
    ["Reject Optional", "rejected"],
  ])("persists %s and allows reopening settings", async (label, choice) => {
    const first = render(<><CookieConsent /><CookieSettingsButton /></>);
    await waitFor(() => expect(screen.getByRole("region", { name: "Cookie preferences" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(JSON.parse(window.localStorage.getItem("uniworksl:cookie-consent:v1") ?? "null")).toMatchObject({ version: 1, choice });
    first.unmount();

    render(<><CookieConsent /><CookieSettingsButton /></>);
    expect(screen.queryByRole("region", { name: "Cookie preferences" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cookie settings" }));
    expect(screen.getByRole("region", { name: "Cookie preferences" })).toBeInTheDocument();
  });
});
