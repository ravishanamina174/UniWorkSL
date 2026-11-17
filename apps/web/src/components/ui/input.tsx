import type { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`min-h-11 w-full rounded-[var(--radius-small)] border border-[var(--border-strong)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] ${className}`} {...props} />;
}
