"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/** Only the decorative image moves; the hero content stays in normal flow. */
export function HeroImage() {
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = image.current;
    const hero = element?.closest(".hero-section");
    if (!element || !hero) return;
    const enabled = window.matchMedia("(prefers-reduced-motion: no-preference) and (min-width: 768px) and (pointer: fine)");
    let frame = 0;
    let visible = true;
    const update = () => {
      frame = 0;
      if (!enabled.matches) { element.style.removeProperty("transform"); return; }
      const bounds = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -bounds.top / bounds.height));
      element.style.transform = `translate3d(0, 0, 0) scale(${1 + progress * 0.055})`;
    };
    const schedule = () => { if (visible && !frame) frame = requestAnimationFrame(update); };
    const configure = () => {
      window.removeEventListener("scroll", schedule);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (enabled.matches) window.addEventListener("scroll", schedule, { passive: true });
      update();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
    });
    observer.observe(hero);
    enabled.addEventListener("change", configure);
    window.addEventListener("resize", schedule, { passive: true });
    configure();
    return () => {
      observer.disconnect();
      enabled.removeEventListener("change", configure);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      element.style.removeProperty("transform");
    };
  }, []);

  return <Image ref={image} src="/Hero.png" alt="" fill priority sizes="100vw" className="hero-image" />;
}
