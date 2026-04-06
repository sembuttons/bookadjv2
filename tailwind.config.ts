import type { Config } from "tailwindcss";

/**
 * bookadj — dark canvas + green accent (Tailwind v4).
 * Loaded via `@config` in src/app/globals.css.
 *
 * Design token map (use bg-*, text-*, border-*, ring-*, etc.):
 * | Token (spec)           | Key             | Hex       |
 * |------------------------|-----------------|-----------|
 * | Background primary     | app             | #0a0a0a   |
 * | Background secondary   | surface         | #111827   |
 * | Background tertiary    | surface-muted   | #0f1f0f   |
 * | Border default         | line            | #1f2937   |
 * | Border accent          | line-brand      | #166534   |
 * | Green primary          | bookadj         | #22c55e   |
 * | Green hover            | bookadj-hover   | #16a34a   |
 * | Green subtle fill      | bookadj-subtle  | #052e16   |
 * | Green text on dark     | bookadj-soft    | #4ade80   |
 * | White                  | (Tailwind white)| #ffffff   |
 * | Text primary           | ink             | #f9fafb   |
 * | Text secondary         | ink-secondary   | #9ca3af   |
 * | Text muted             | ink-muted       | #4b5563   |
 * | Red (errors)           | danger          | #ef4444   |
 * | Amber (warnings)       | caution         | #f59e0b   |
 */
export default {
  theme: {
    extend: {
      colors: {
        app: "#0a0a0a",
        surface: "#111827",
        "surface-muted": "#0f1f0f",
        line: "#1f2937",
        "line-brand": "#166534",
        bookadj: "#22c55e",
        "bookadj-hover": "#16a34a",
        "bookadj-subtle": "#052e16",
        "bookadj-soft": "#4ade80",
        ink: "#f9fafb",
        "ink-secondary": "#9ca3af",
        "ink-muted": "#4b5563",
        danger: "#ef4444",
        caution: "#f59e0b",
      },
    },
  },
} satisfies Config;
