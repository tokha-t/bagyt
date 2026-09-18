import raw from "@/data/programs.json";
import { Program, Provenance } from "./types";
export const DEMO: Provenance = { status: "demo" };
export const COMPUTED: Provenance = {
  status: "expected",
  basis:
    "Calculated from your answers and the labelled dataset; a fit score only.",
};
export function validateProvenance(p: Provenance): Provenance {
  const valid =
    p.status === "demo" ||
    (p.status === "verified" &&
      p.sourceUrl?.startsWith("https://") &&
      p.checkedOn) ||
    (p.status === "expected" && p.basis);
  if (valid) return p;
  if (process.env.NODE_ENV === "development")
    throw new Error("Missing provenance metadata");
  return DEMO;
}
export const programs: Program[] = raw.map(
  (p) =>
    ({
      ...p,
      tuitionProvenance: validateProvenance(p.tuitionProvenance as Provenance),
      cutoffProvenance: validateProvenance(p.cutoffProvenance as Provenance),
      grantCutoffProvenance:
        "grantCutoffProvenance" in p && p.grantCutoffProvenance
          ? validateProvenance(p.grantCutoffProvenance as Provenance)
          : undefined,
      deadlines: p.deadlines.map((d) => ({
        ...d,
        provenance: validateProvenance(d.provenance as Provenance),
      })),
    }) as Program,
);
for (const p of programs) {
  if (!p.grantAvailable && p.grantCutoff !== null)
    throw new Error("Invalid grant dataset");
}
export const money = (n: number) =>
  new Intl.NumberFormat("en-KZ", { maximumFractionDigits: 0 }).format(n) + " ₸";
