import type { HTMLAttributes } from "react";

export function BorderedContainer({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`rounded-[var(--radius-small)] border border-[var(--border)] bg-[var(--surface-raised)] ${className}`} {...props} />;
}
