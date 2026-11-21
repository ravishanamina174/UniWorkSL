"use client";

import { useEffect, useRef } from "react";
import { CalendarClock, MapPinned, MessageSquareMore, ShieldAlert } from "lucide-react";
import { BrandSymbol } from "@/components/brand/brand-symbol";
import { Container } from "@/components/ui/container";

const challenges = [
  { title: "Scattered job posts", detail: "Opportunities lost across groups and messages.", icon: MessageSquareMore, color: "blue" },
  { title: "Unclear safety details", detail: "Too little context before meeting for work.", icon: ShieldAlert, color: "purple" },
  { title: "Rigid work schedules", detail: "Hours that conflict with university studies.", icon: CalendarClock, color: "amber" },
  { title: "Hard to find local help", detail: "Finding a suitable person nearby takes time.", icon: MapPinned, color: "green" },
];

export function ConnectionDiagram() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const visual = node.querySelector<HTMLElement>(".connection-visual");
    const paths = node.querySelectorAll<SVGPathElement>(".connection-lines path");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!visual) return;
      const rect = visual.getBoundingClientRect();
      const start = window.innerHeight * .85;
      const end = window.innerHeight * .25;
      const progress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, (start - rect.top) / (rect.height + start - end)));
      paths.forEach((path) => { path.style.strokeDashoffset = String(1 - progress); });
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); reducedMotion.removeEventListener("change", schedule); };
  }, []);
  return <section ref={section} className="section connection-section" aria-labelledby="connection-title"><Container><div className="connection-heading"><p className="eyebrow">ONE CONNECTED MARKETPLACE</p><h2 id="connection-title" className="section-title">Different challenges.<br /><span className="accent-text">One UniWorkSL.</span></h2><p>Finding flexible work and reliable local help shouldn’t depend on scattered posts and endless searching. UniWorkSL brings students and Task Posters together in one connected marketplace.</p></div><div className="connection-visual"><div className="connection-sources">{challenges.map(({ title, detail, icon: Icon, color }) => <div className={`connection-source ${color}`} key={title}><span className="connection-icon"><Icon size={23} aria-hidden="true" /></span><div><h3>{title}</h3><p>{detail}</p></div></div>)}</div><svg className="connection-lines" viewBox="0 0 420 440" preserveAspectRatio="none" fill="none" aria-hidden="true"><path pathLength="1" className="blue" d="M0 52 C165 52 150 215 420 220" /><path pathLength="1" className="purple" d="M0 164 C150 164 175 215 420 220" /><path pathLength="1" className="amber" d="M0 276 C150 276 175 225 420 220" /><path pathLength="1" className="green" d="M0 388 C165 388 150 225 420 220" /></svg><div className="connection-destination"><span className="connection-brand"><BrandSymbol className="brand-mark" /><strong>UniWorkSL</strong></span><h3>One connected task marketplace.</h3><p>Local opportunities for students. Practical help for Task Posters.</p></div></div></Container></section>;
}
