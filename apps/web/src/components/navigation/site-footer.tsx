import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandSymbol } from "@/components/brand/brand-symbol";
// import { CookieSettingsButton } from "./cookie-consent";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-intro">
          <Link href="/#top" className="brand-lockup footer-brand" aria-label="UniWorkSL home"><BrandSymbol className="brand-mark" /><span>UniWorkSL</span></Link>
          <p>The First Dedicated Student Task Network in Sri Lanka.</p>
          
        </div>
        <nav className="footer-link-group" aria-label="Explore UniWorkSL">
          <span>Explore</span>
          <Link href="/#about">Why UniWork</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#safety">Student safety</Link>
        </nav>
        <nav className="footer-link-group" aria-label="Get started with UniWorkSL">
          <span>Get started</span>
          <Link href="/#student-app">Student app <ArrowUpRight size={14} aria-hidden="true" /></Link>
          <Link href="/dashboard">Post a task <ArrowUpRight size={14} aria-hidden="true" /></Link>
          <Link href="/#categories">Task categories <ArrowUpRight size={14} aria-hidden="true" /></Link>
        </nav>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} UniWork Sri Lanka. All rights reserved.</span><span>Made in Sri Lanka</span></div>
      <div className="footer-wordmark" aria-hidden="true">UniWorkSL</div>
    </footer>
  );
}
