export function BrandSymbol({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 3.5 43.5 14.75v18.5L24 44.5 4.5 33.25v-18.5L24 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m4.8 14.9 19.2 11 19.2-11M24 26v18" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M29.2 21.6v6.5c0 3 2 4.6 4.1 4.6s4.1-1.6 4.1-4.6v-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
