import { DimensionKey, Phase } from "@/lib/types";

export type MarkName = DimensionKey | Phase;

/**
 * Ten signature marks: one per scoring dimension, one per roadmap phase.
 * One 24x24 grid, one 1.5 stroke weight, currentColor only, no eleventh mark
 * outside the companion. Each mark means exactly one thing everywhere it appears.
 */
const PATHS: Record<MarkName, React.ReactNode> = {
  // ascending bar triad
  academic: (
    <>
      <path d="M5 16v3" />
      <path d="M12 11v8" />
      <path d="M19 6v13" />
    </>
  ),
  // a circle with a horizontal cut
  financial: (
    <>
      <circle cx="12" cy="12" r="7.25" />
      <path d="M5.5 12h13" />
    </>
  ),
  // two overlapping arcs
  language: (
    <>
      <path d="M9.5 5.5a8 8 0 0 0 0 13" />
      <path d="M14.5 5.5a8 8 0 0 1 0 13" />
    </>
  ),
  // a four-petal cross
  field: (
    <>
      <path d="M12 4.5A4 4 0 0 0 12 12a4 4 0 0 0 0-7.5Z" />
      <path d="M12 19.5A4 4 0 0 1 12 12a4 4 0 0 1 0 7.5Z" />
      <path d="M4.5 12A4 4 0 0 1 12 12a4 4 0 0 1-7.5 0Z" />
      <path d="M19.5 12A4 4 0 0 0 12 12a4 4 0 0 0 7.5 0Z" />
    </>
  ),
  // a bearing diamond
  geography: (
    <>
      <path d="M12 4 19 12l-7 8-7-8Z" />
      <path d="M12 9.5 14.5 12 12 14.5 9.5 12Z" />
    </>
  ),
  // a quarter-filled ring
  timing: (
    <>
      <circle cx="12" cy="12" r="7.25" />
      <path d="M12 4.75V12h7.25" />
    </>
  ),
  // a filled square
  exams: <rect x="5.5" y="5.5" width="13" height="13" rx="2" fill="currentColor" />,
  // a folded corner
  documents: (
    <>
      <path d="M6 4.75h8L18 9v10.25H6Z" />
      <path d="M14 4.75V9h4" />
    </>
  ),
  // an outward arrow
  applications: (
    <>
      <path d="M5.5 18.5 18 6" />
      <path d="M10.5 6H18v7.5" />
    </>
  ),
  // a five-point asterisk
  activities: (
    <>
      <path d="M12 4.75v14.5" />
      <path d="M5.1 9.5 18.9 16" />
      <path d="M18.9 9.5 5.1 16" />
    </>
  ),
};

export default function Mark({
  name,
  size = 24,
  className,
}: {
  name: MarkName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className ? `mark ${className}` : "mark"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

export const DIMENSION_MARKS: MarkName[] = [
  "academic",
  "financial",
  "language",
  "field",
  "geography",
  "timing",
];
export const PHASE_MARKS: MarkName[] = [
  "exams",
  "documents",
  "applications",
  "activities",
];

/** The dimension marks as a large, very low-opacity wallpaper. */
export function MarkWall({ id = "markwall" }: { id?: string }) {
  return (
    <div className="mark-wall" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={id}
            width="360"
            height="240"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-12)"
          >
            {DIMENSION_MARKS.map((name, i) => (
              <g
                key={name}
                transform={`translate(${(i % 3) * 120 + 18} ${Math.floor(i / 3) * 120 + 18}) scale(3.5)`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {PATHS[name]}
                </svg>
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
