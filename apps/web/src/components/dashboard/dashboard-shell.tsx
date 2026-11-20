"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BriefcaseBusiness, ChevronRight, FileSearch, FileText, LayoutDashboard, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BrandSymbol } from "@/components/brand/brand-symbol";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/tasks", label: "Posted Tasks", icon: BriefcaseBusiness },
  { href: "/dashboard/applications", label: "Applications", icon: FileText },
  { href: "/dashboard/student-lookup", label: "Student Lookup", icon: FileSearch },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard", tasks: "Posted Tasks", new: "Create Task", applications: "Applications", "student-lookup": "Student Lookup", profile: "Profile", onboarding: "Complete Profile", edit: "Edit Task",
};

export function DashboardShell({ children, displayName }: { children: React.ReactNode; displayName: string }) {
  const pathname = usePathname();
  const mobileNav = useRef<HTMLElement>(null);
  const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? "dashboard";
  const pageLabel = routeLabels[lastSegment] ?? (lastSegment === "dashboard" ? "Dashboard" : "Task Details");

  useEffect(() => {
    const row = mobileNav.current;
    const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !active || row.clientWidth === 0 || typeof row.scrollTo !== "function") return;
    const itemLeft = active.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft;
    row.scrollTo({ left: Math.max(0, itemLeft - (row.clientWidth - active.clientWidth) / 2), behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="dashboard-root">
      <header className="dashboard-topbar">
        <div className="dashboard-top-left">
          <Link href="/" className="brand-lockup"><BrandSymbol className="brand-mark" /><span>UniWorkSL</span></Link>
          <div className="dashboard-breadcrumb"><span>Task Poster</span><ChevronRight size={15} aria-hidden="true" /><strong>{pageLabel}</strong></div>
        </div>
        <div className="dashboard-top-right"><ThemeToggle /><span className="dashboard-user-name">{displayName}</span><UserButton /></div>
      </header>
      <nav ref={mobileNav} className="dashboard-mobile-nav" aria-label="Mobile dashboard navigation">
        {navigation.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} className={`dashboard-mobile-nav-link${active ? " active" : ""}`} aria-current={active ? "page" : undefined}><Icon size={17} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span></Link>;
        })}
      </nav>
      <div className="dashboard-body">
        <aside id="dashboard-sidebar" className="dashboard-sidebar" aria-label="Dashboard sidebar">
          <span className="dashboard-sidebar-label">WORKSPACE</span>
          <nav aria-label="Dashboard navigation">
            {navigation.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return <Link key={href} className={`dashboard-nav-link${active ? " active" : ""}`} href={href} aria-current={active ? "page" : undefined}><Icon size={17} strokeWidth={1.7} aria-hidden="true" />{label}</Link>;
            })}
          </nav>
          <div className="dashboard-sidebar-foot">UniWork Sri Lanka · V1</div>
        </aside>
        <main id="main-content" className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
