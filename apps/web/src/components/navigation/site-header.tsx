"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { BrandSymbol } from "@/components/brand/brand-symbol";

const links = [
  { href: "#about", label: "Why UniWork" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#safety", label: "Student safety" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-lockup" aria-label="UniWorkSL home"><BrandSymbol className="brand-mark" /><span>UniWorkSL</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
        <div className="header-actions"><ThemeToggle /><a className="header-download" href="#student-app">Download app</a><Link className="header-dashboard" href="/dashboard">Post a task <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
        <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
      {menuOpen && <div className="mobile-nav-panel" id="mobile-navigation"><nav aria-label="Mobile navigation">{links.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}<ArrowUpRight size={15} aria-hidden="true" /></a>)}<Link href="/dashboard" onClick={() => setMenuOpen(false)}>Open Dashboard<ArrowUpRight size={15} aria-hidden="true" /></Link><a href="#student-app" onClick={() => setMenuOpen(false)}>Student app<ArrowUpRight size={15} aria-hidden="true" /></a></nav></div>}
    </header>
  );
}
