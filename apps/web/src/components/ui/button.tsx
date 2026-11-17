import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "light" | "dark-outline";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant };

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`button button-${variant} ${className}`} {...props} />;
}

export function ButtonLink({ href, variant = "primary", className = "", children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: ButtonVariant; children: ReactNode }) {
  return <Link href={href} className={`button button-${variant} ${className}`} {...props}>{children}</Link>;
}
