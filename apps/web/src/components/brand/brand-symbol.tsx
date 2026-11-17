
export function BrandSymbol({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 3D Cube Outer Shell */}
      <path
        d="M50 10L85 28V72L50 90L15 72V28L50 10Z"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
      />

      {/* Cube Inner Y-Lines */}
      <path
        d="M15 28L50 48L85 28"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
      />

      <path
        d="M50 48V90"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
      />

      {/* Embedded U Symbol */}
      <path
        d="M62 43V60C62 65 73 65 73 60V38"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
