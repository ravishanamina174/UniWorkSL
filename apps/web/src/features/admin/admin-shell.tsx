"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { Activity, ChevronRight, ClipboardList, FileWarning, LayoutDashboard, MapPinned, ShieldAlert, ScanFace } from "lucide-react";
import { BrandSymbol } from "@/components/brand/brand-symbol";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const links = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/tasks", label: "Active Tasks", icon: MapPinned },
  { href: "/admin/watchlist", label: "Safety Watchlist", icon: ShieldAlert },
  { href: "/admin/disputes", label: "Payment Disputes", icon: FileWarning },
  { href: "/admin/cases", label: "Investigations", icon: ClipboardList },
  { href: "/admin/identity-reviews", label: "Identity Reviews", icon: ScanFace },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: Activity },
];

export function AdminShell({ children, name }: { children: React.ReactNode; name: string }) {
  const path = usePathname();
  const mobileNav = useRef<HTMLElement>(null);
  useEffect(() => {
    const row = mobileNav.current;
    const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !active || row.clientWidth === 0 || typeof row.scrollTo !== "function") return;
    const left = active.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft;
    row.scrollTo({ left: Math.max(0, left - (row.clientWidth - active.clientWidth) / 2), behavior: "smooth" });
  }, [path]);
  const pageLabel = links.find(({ href }) => href === path)?.label ?? "Overview";
  return <div className="admin-root"><header className="admin-topbar"><div className="admin-top-left"><Link href="/" className="admin-brand"><BrandSymbol className="brand-mark" /><span>UniWorkSL</span></Link><div className="admin-breadcrumb"><span>Safety Admin</span><ChevronRight size={15} aria-hidden="true" /><strong>{pageLabel}</strong></div></div><div className="admin-account"><ThemeToggle /><span>{name}</span><UserButton /></div></header>
    <div className="admin-frame"><aside className="admin-sidebar"><p className="admin-nav-label">SAFETY WORKSPACE</p><nav aria-label="Safety administration">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={path === href ? "admin-nav-link active" : "admin-nav-link"} aria-current={path === href ? "page" : undefined}><Icon size={18} aria-hidden="true" />{label}</Link>)}</nav><p className="admin-sidebar-note">Private operations · Authorized team only</p></aside><div className="admin-content"><nav ref={mobileNav} className="admin-mobile-nav" aria-label="Mobile safety administration">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={path === href ? "active" : ""} aria-current={path === href ? "page" : undefined}><Icon size={16} aria-hidden="true" />{label}</Link>)}</nav><main id="main-content">{children}</main></div></div>
  </div>;
}
