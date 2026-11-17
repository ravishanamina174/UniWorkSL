"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BriefcaseBusiness, ChevronRight, FileText, LayoutDashboard, Menu, UserRound, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BrandSymbol } from "@/components/brand/brand-symbol";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/tasks", label: "Posted Tasks", icon: BriefcaseBusiness },
  { href: "/dashboard/applications", label: "Applications", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard", tasks: "Posted Tasks", new: "Create Task", applications: "Applications", profile: "Profile", onboarding: "Complete Profile", edit: "Edit Task",
};

export function DashboardShell({ children, displayName }: { children: React.ReactNode; displayName: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? "dashboard";
  const pageLabel = routeLabels[lastSegment] ?? (lastSegment === "dashboard" ? "Dashboard" : "Task Details");

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <div className="dashboard-root">
      <header className="dashboard-topbar">
        <div className="dashboard-top-left">
          <button className="dashboard-mobile-menu" type="button" aria-label={menuOpen ? "Close dashboard navigation" : "Open dashboard navigation"} aria-expanded={menuOpen} aria-controls="dashboard-sidebar" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
          <Link href="/" className="brand-lockup"><BrandSymbol className="brand-mark" /><span>UniWorkSL</span><small>WORKSPACE</small></Link>
          <div className="dashboard-breadcrumb"><ChevronRight size={14} aria-hidden="true" /><span>Task Poster</span><ChevronRight size={14} aria-hidden="true" /><strong>{pageLabel}</strong></div>
        </div>
        <div className="dashboard-top-right"><ThemeToggle /><span className="dashboard-user-name">{displayName}</span><UserButton /></div>
      </header>
      <div className="dashboard-body">
        {menuOpen ? <button className="dashboard-mobile-overlay" type="button" aria-label="Close dashboard navigation" onClick={() => setMenuOpen(false)} /> : null}
        <aside id="dashboard-sidebar" className="dashboard-sidebar" data-open={menuOpen} aria-label="Dashboard sidebar">
          <span className="dashboard-sidebar-label">WORKSPACE</span>
          <nav aria-label="Dashboard navigation">
            {navigation.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return <Link key={href} className={`dashboard-nav-link${active ? " active" : ""}`} href={href} aria-current={active ? "page" : undefined} onClick={() => setMenuOpen(false)}><Icon size={17} strokeWidth={1.7} aria-hidden="true" />{label}</Link>;
            })}
          </nav>
          <div className="dashboard-sidebar-foot">UniWork Sri Lanka · V1</div>
        </aside>
        <main id="main-content" className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
