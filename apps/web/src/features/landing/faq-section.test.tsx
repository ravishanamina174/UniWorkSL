import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FaqSection } from "./faq-section";

afterEach(cleanup);

it("opens one answer at a time and lets the visitor close it", () => {
  render(<FaqSection />);
  const first = screen.getByRole("button", { name: /what is uniworksl/i });
  const second = screen.getByRole("button", { name: /how can students find/i });
  expect(first).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(first);
  expect(first).toHaveAttribute("aria-expanded", "true");
  fireEvent.click(second);
  expect(first).toHaveAttribute("aria-expanded", "false");
  expect(second).toHaveAttribute("aria-expanded", "true");
  fireEvent.click(second);
  expect(second).toHaveAttribute("aria-expanded", "false");
});
