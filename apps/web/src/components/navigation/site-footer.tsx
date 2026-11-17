import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main"><Link href="/" className="brand-lockup footer-brand" aria-label="UniWork home"><span className="brand-mark">U</span><span>uniwork</span><small>SRI LANKA</small></Link><p>Making local work easier to find<br />and easier to coordinate.</p><Link href="/dashboard" className="footer-dashboard">Task Poster Dashboard <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} UniWork Sri Lanka</span><span>Local tasks. Real people. Clear coordination.</span><a href="#about">Back to top ↑</a></div>
    </footer>
  );
}
