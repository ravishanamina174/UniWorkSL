"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, LayoutDashboard, Menu, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BrandSymbol } from "@/components/brand/brand-symbol";
import { STUDENT_CATEGORIES } from "@uniwork/api-contracts";

const links = [
  { href: "#about", label: "Why UniWork" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#safety", label: "Student safety" },
];

export function SiteHeader() {
  const { user, isLoaded } = useUser();
  const isAdmin = isLoaded && user?.publicMetadata?.role === "Admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!categoriesOpen) return;
    const close = (event: PointerEvent) => { if (!categoriesRef.current?.contains(event.target as Node)) setCategoriesOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setCategoriesOpen(false); };
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, [categoriesOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header id="top" className="site-header">
      <div className="site-header-inner">
        <Link href="/#top" className="brand-lockup" aria-label="UniWorkSL home"><BrandSymbol className="brand-mark" /><span className="brand-wordmark">UniWorkSL</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map((link) => <Link key={link.href} href={`/${link.href}`} onClick={() => setCategoriesOpen(false)}>{link.label}</Link>)}<div ref={categoriesRef} className="categories-nav" onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => setCategoriesOpen(false)}><button type="button" aria-expanded={categoriesOpen} aria-controls="desktop-categories" onClick={() => setCategoriesOpen(true)}>Categories <ChevronDown size={14} aria-hidden="true" /></button>{categoriesOpen && <div id="desktop-categories" className="categories-dropdown">{STUDENT_CATEGORIES.map((category) => <Link href={`/categories/${category.slug}`} onClick={() => setCategoriesOpen(false)} key={category.value}>{category.label}</Link>)}</div>}</div></nav>
        <div className="header-actions"><ThemeToggle /><Link className="header-download" href="/#student-app">Download app</Link>{isLoaded && <Link className="header-dashboard" href={isAdmin ? "/admin/dashboard" : "/dashboard"}>{isAdmin ? <>Open Admin Workspace <LayoutDashboard size={15} aria-hidden="true" /></> : <>Post a task <ArrowUpRight size={15} aria-hidden="true" /></>}</Link>}</div>
        <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => { setMenuOpen((open) => !open); setMobileCategoriesOpen(false); }}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
      {menuOpen && <div className="mobile-nav-panel" id="mobile-navigation"><nav aria-label="Mobile navigation">{links.map((link) => <Link key={link.href} href={`/${link.href}`} onClick={() => { setMenuOpen(false); setMobileCategoriesOpen(false); }}>{link.label}<ArrowUpRight size={15} aria-hidden="true" /></Link>)}<button className="mobile-category-toggle" type="button" aria-expanded={mobileCategoriesOpen} aria-controls="mobile-categories" onClick={() => setMobileCategoriesOpen((open) => !open)}>Categories<ChevronDown size={16} aria-hidden="true" /></button>{mobileCategoriesOpen && <div id="mobile-categories" className="mobile-categories">{STUDENT_CATEGORIES.map((category) => <Link key={category.value} href={`/categories/${category.slug}`} onClick={() => { setMenuOpen(false); setMobileCategoriesOpen(false); }}>{category.label}<ArrowUpRight size={15} aria-hidden="true" /></Link>)}</div>}{isLoaded && <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} onClick={() => { setMenuOpen(false); setMobileCategoriesOpen(false); }}>{isAdmin ? "Open Admin Workspace" : "Open Dashboard"}<ArrowUpRight size={15} aria-hidden="true" /></Link>}<Link href="/#student-app" onClick={() => { setMenuOpen(false); setMobileCategoriesOpen(false); }}>Student app<ArrowUpRight size={15} aria-hidden="true" /></Link></nav></div>}
    </header>
  );
}
