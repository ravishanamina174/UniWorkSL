import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" };

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const style = variant === "primary"
    ? "border-transparent bg-[var(--foreground)] text-[var(--background)] hover:opacity-85"
    : "border-[var(--border-strong)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface)]";
  return <button className={`inline-flex min-h-11 items-center justify-center rounded-[var(--radius-small)] border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${style} ${className}`} {...props} />;
}
