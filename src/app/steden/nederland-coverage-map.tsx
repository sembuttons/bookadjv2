"use client";

/**
 * Simplified NL outline + city markers (normalized viewBox coordinates).
 * Tooltips via native <title> in SVG.
 */
const NL_PATH =
  "M12 88 L16 72 L28 58 L42 48 L58 42 L76 38 L88 34 L92 26 L88 18 L76 12 L58 8 L42 10 L30 18 L22 32 L14 48 L10 64 L10 78 Z";

const CITIES: { name: string; cx: number; cy: number }[] = [
  { name: "Amsterdam", cx: 52, cy: 40 },
  { name: "Rotterdam", cx: 46, cy: 58 },
  { name: "Utrecht", cx: 54, cy: 46 },
  { name: "Den Haag", cx: 44, cy: 50 },
  { name: "Eindhoven", cx: 62, cy: 52 },
  { name: "Groningen", cx: 58, cy: 22 },
];

export function NederlandCoverageMap() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-line-brand/50 bg-surface-muted/40 p-6 shadow-sm ring-1 ring-line-brand/35 sm:p-10">
      <svg
        viewBox="0 0 100 100"
        className="mx-auto h-auto w-full max-w-md overflow-visible"
        aria-hidden
      >
        <defs>
          <linearGradient id="nl-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <path
          d={NL_PATH}
          fill="url(#nl-fill)"
          fillOpacity={0.85}
          stroke="#166534"
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
        {CITIES.map(({ name, cx, cy }) => (
          <g key={name} className="cursor-default">
            <circle
              cx={cx}
              cy={cy}
              r={3.2}
              fill="#4ade80"
              stroke="#166534"
              strokeWidth={0.5}
              className="animate-pulse"
            />
            <circle cx={cx} cy={cy} r={1.2} fill="#f9fafb" className="animate-pulse" />
            <title>{name}</title>
          </g>
        ))}
      </svg>
      <p className="mt-6 text-center text-sm font-semibold text-bookadj-soft sm:text-base">
        500+ DJ&apos;s · Heel Nederland gedekt
      </p>
    </div>
  );
}
