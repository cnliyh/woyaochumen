const PATHS = {
  wave: (
    <>
      <path d="M2 9c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
      <path d="M2 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
    </>
  ),
  mountain: <path d="M3 19.5h18L14.5 5.5 9 14l-2-3-4 8.5z" />,
  tent: (
    <>
      <path d="M3 19.5a9 9 0 0118 0" />
      <path d="M2 19.5h20" />
      <path d="M8.6 19.5L12 13l3.4 6.5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
      <path d="M8.5 7.5V5.5A1.5 1.5 0 0110 4h4a1.5 1.5 0 011.5 1.5v2" />
      <path d="M3 12.5h18" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M6.5 8v8" />
      <path d="M3.5 9.5v5" />
      <path d="M17.5 8v8" />
      <path d="M20.5 9.5v5" />
      <path d="M6.5 12h11" />
    </>
  ),
  back: <path d="M15 19l-7-7 7-7" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2" />
      <path d="M12 19.5v2" />
      <path d="M4.7 4.7l1.4 1.4" />
      <path d="M17.9 17.9l1.4 1.4" />
      <path d="M2.5 12h2" />
      <path d="M19.5 12h2" />
      <path d="M4.7 19.3l1.4-1.4" />
      <path d="M17.9 6.1l1.4-1.4" />
    </>
  ),
  cloud: <path d="M7 18h10a4 4 0 000-8 6 6 0 00-11.5 1.6A3.5 3.5 0 007 18z" />,
  rain: (
    <>
      <path d="M7 15h10a4 4 0 000-8 6 6 0 00-11.5 1.6A3.5 3.5 0 007 15z" />
      <path d="M8 18l-1 3" />
      <path d="M12 18l-1 3" />
      <path d="M16 18l-1 3" />
    </>
  ),
  snow: (
    <>
      <path d="M7 15h10a4 4 0 000-8 6 6 0 00-11.5 1.6A3.5 3.5 0 007 15z" />
      <path d="M9 19v2" />
      <path d="M15 19v2" />
      <path d="M12 18.5v2.5" />
    </>
  ),
  fog: (
    <>
      <path d="M5 9h14" />
      <path d="M3 13h18" />
      <path d="M5 17h14" />
    </>
  ),
  storm: (
    <>
      <path d="M7 15h10a4 4 0 000-8 6 6 0 00-11.5 1.6A3.5 3.5 0 007 15z" />
      <path d="M12 17l-2 4h3" />
    </>
  )
}

export default function Icon({ name, size = 22, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.cloud}
    </svg>
  )
}
