import {
  Profile,
  Program,
  DimensionKey,
  MatchResult,
  Tier,
  BUDGET_CEILING,
  GRANT_TUITION_CEILING,
} from "./types";
import { reasonFor } from "./reasons";
export const DIMENSIONS: DimensionKey[] = [
  "academic",
  "financial",
  "language",
  "field",
  "geography",
  "timing",
];
export const REFERENCE_DATE = "2026-09-18";
const base: Record<DimensionKey, number> = {
  academic: 0.25,
  financial: 0.25,
  language: 0.15,
  field: 0.2,
  geography: 0.1,
  timing: 0.05,
};
const clamp = (n: number) =>
  Math.round(Math.max(0, Math.min(100, Number.isFinite(n) ? n : 55)));
export function resolveWeights(p: Profile): Record<DimensionKey, number> {
  const fixed: Partial<Record<DimensionKey, number>> = {};
  if (p.budget === "grant-only") {
    fixed.financial = 0.35;
    fixed.academic = 0.3;
  }
  if (p.field === "undecided") fixed.field = 0.1;
  if (p.unt === undefined) fixed.academic = 0.15;
  if (p.regions?.includes("any")) fixed.geography = 0.05;
  const left = 1 - Object.values(fixed).reduce((a, b) => a + b, 0);
  const denom = DIMENSIONS.reduce(
    (a, k) => a + (fixed[k] === undefined ? base[k] : 0),
    0,
  );
  const w = { ...base };
  for (const k of DIMENSIONS) w[k] = fixed[k] ?? (base[k] * left) / denom;
  w.timing += 1 - DIMENSIONS.reduce((a, k) => a + w[k], 0);
  return w;
}
export function tierOf(n: number): Tier {
  return n >= 75
    ? "strong"
    : n >= 55
      ? "realistic"
      : n >= 35
        ? "stretch"
        : "notyet";
}
export function effectiveCost(p: Profile, r: Program): number {
  return r.grantAvailable &&
    p.unt !== undefined &&
    r.grantCutoff !== null &&
    p.unt >= r.grantCutoff
    ? Math.max(0, r.tuitionPerYear - GRANT_TUITION_CEILING)
    : r.tuitionPerYear;
}
export function regionFit(p: Profile, r: Program): number {
  const regions = p.regions;
  if (!regions?.length) return 60;
  if (regions.includes("any")) return 100;
  const region =
    r.country === "KZ"
      ? "kazakhstan"
      : r.country === "UZ"
        ? "central-asia"
        : r.country === "TR"
          ? "turkiye"
          : ["HU", "PL", "CZ"].includes(r.country)
            ? "europe"
            : "asia";
  if (regions.includes(region)) return 100;
  if (regions.includes("my-city")) return 60;
  if (
    (region === "kazakhstan" && regions.includes("central-asia")) ||
    (region === "central-asia" && regions.includes("kazakhstan"))
  )
    return 60;
  return 15;
}
export function scoreProgram(
  p: Profile,
  r: Program,
  today = REFERENCE_DATE,
): MatchResult {
  const w = resolveWeights(p);
  const cost = effectiveCost(p, r);
  const budget = p.budget ? BUDGET_CEILING[p.budget] : undefined;
  const lang = p.languages
    ? Math.max(
        10,
        ...(r.languages ?? []).map(
          (l) =>
            ({ fluent: 100, working: 75, basic: 45 })[
              p.languages?.[l] ?? "basic"
            ] * (p.languages?.[l] ? 1 : 0),
        ),
      )
    : 55;
  const ielts = p.englishCert?.kind === "ielts" ? p.englishCert.band : 0;
  const dates = (r.deadlines ?? [])
    .map((d) => `${p.startYear ?? 2027}${d.date.slice(4)}`)
    .sort();
  const date =
    dates.find((d) => d >= today) ??
    dates.at(-1) ??
    `${p.startYear ?? 2027}-09-01`;
  const days = (Date.parse(date) - Date.parse(today)) / 86400000;
  const s: Record<DimensionKey, number> = {
    academic:
      p.unt !== undefined
        ? 50 + (p.unt - (r.untCutoff ?? 90)) * 3.5
        : { excellent: 75, good: 60, average: 45, undisclosed: 55 }[
            p.gradeBand ?? "undisclosed"
          ],
    financial:
      budget === undefined
        ? 55
        : cost === 0
          ? 100
          : 120 -
            (cost / (budget === 0 ? GRANT_TUITION_CEILING : budget)) * 100,
    language:
      r.requiresIelts && ielts < r.requiresIelts ? Math.min(40, lang) : lang,
    field:
      p.field === "undecided"
        ? 60
        : p.field === r.field
          ? 100
          : (r.adjacentFields ?? []).includes(p.field)
            ? 65
            : 20,
    geography: regionFit(p, r),
    timing: days >= 90 ? 100 : days >= 30 ? 70 : days >= 1 ? 40 : 15,
  };
  const dimensions = DIMENSIONS.map((key) => {
    const score = clamp(s[key]);
    return {
      key,
      score,
      weight: w[key],
      reason: reasonFor(key, score, {
        profile: p,
        program: r,
        band: score >= 75 ? 3 : score >= 55 ? 2 : score >= 35 ? 1 : 0,
      }),
    };
  });
  const match = clamp(dimensions.reduce((a, d) => a + d.score * d.weight, 0));
  return {
    program: r,
    match,
    tier: tierOf(match),
    dimensions,
    ...(cost < r.tuitionPerYear && cost > 0 ? { grantGap: cost } : {}),
  };
}
export function rankPrograms(
  p: Profile,
  programs: Program[],
  opts?: { limit?: number; minResults?: number; today?: string },
): MatchResult[] {
  const all = programs
    .map((r) => scoreProgram(p, r, opts?.today))
    .sort(
      (a, b) =>
        b.match - a.match ||
        (a.program.id < b.program.id
          ? -1
          : a.program.id > b.program.id
            ? 1
            : 0),
    );
  const weights = resolveWeights(p);
  const constraints: DimensionKey[] = [];
  if (p.field !== "undecided") constraints.push("field");
  if (p.regions?.length && !p.regions.includes("any"))
    constraints.push("geography");
  if (p.budget) constraints.push("financial");
  const passes = (m: MatchResult, k: DimensionKey) =>
    k === "field"
      ? m.program.field === p.field
      : k === "geography"
        ? regionFit(p, m.program) === 100
        : effectiveCost(p, m.program) <= BUDGET_CEILING[p.budget ?? "over-6m"];
  const active = [...constraints];
  const removed: DimensionKey[] = [];
  let matches = all.filter((m) => active.every((k) => passes(m, k)));
  const minimum = Math.max(3, opts?.minResults ?? 3);
  while (matches.length < minimum && active.length) {
    active.sort((a, b) => weights[a] - weights[b] || a.localeCompare(b));
    const k = active.shift();
    if (k) removed.push(k);
    matches = all.filter((m) => active.every((k) => passes(m, k)));
  }
  return matches.slice(0, Math.max(minimum, opts?.limit ?? 5)).map((m) => {
    const relaxed = removed.filter((k) => !passes(m, k));
    return relaxed.length
      ? {
          ...m,
          relaxed: {
            dimension: relaxed[0],
            explanation: `Widened ${relaxed.join(" and ")} to keep at least ${minimum} options available.`,
          },
        }
      : m;
  });
}
