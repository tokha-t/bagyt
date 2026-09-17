import { DimensionKey, Profile, Program } from "./types";
const lead = [
  "Needs preparation",
  "A trade-off",
  "A workable fit",
  "A close fit",
];
export function reasonFor(
  key: DimensionKey,
  score: number,
  ctx: { profile: Profile; program: Program; band: 0 | 1 | 2 | 3 },
): string {
  const { profile: p, program: r, band } = ctx;
  const details: Record<DimensionKey, string> = {
    academic:
      p.unt !== undefined
        ? `UNT ${p.unt} is compared with the labelled ${r.untCutoff}-point benchmark.`
        : `No UNT supplied; school grades inform a ${score}/100 provisional fit.`,
    financial: `Tuition is ${r.tuitionPerYear.toLocaleString("en")} ₸ per year; the demo grant model uses a 1,000,000 ₸ cap.`,
    language: `${r.languages.length} teaching language(s) compared with your declared levels${r.requiresIelts ? `; IELTS reference ${r.requiresIelts}` : ""}.`,
    field: `Your interest in ${p.field} gives ${score}/100 against ${r.field}.`,
    geography: p.regions?.includes("my-city")
      ? `No city was collected; location is provisionally scored ${score}/100.`
      : `${r.country} compared with ${p.regions?.length ?? 0} selected region(s), giving ${score}/100.`,
    timing: `The ${p.startYear ?? 2027} intake planning window gives ${score}/100 preparation time.`,
  };
  return `${lead[band]}. ${details[key]}`;
}
