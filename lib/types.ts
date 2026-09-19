export type Grade = 9 | 10 | 11 | "graduated";

export type Field =
  | "it"
  | "medicine"
  | "engineering"
  | "business"
  | "law"
  | "design"
  | "education"
  | "science"
  | "humanities"
  | "media"
  | "agriculture"
  | "undecided";

export type GradeBand = "excellent" | "good" | "average" | "undisclosed";
export type Lang = "kk" | "ru" | "en";
export type LangLevel = "fluent" | "working" | "basic";
export type BudgetBand =
  | "grant-only"
  | "under-1m"
  | "1-3m"
  | "3-6m"
  | "over-6m";
export type Region =
  | "my-city"
  | "kazakhstan"
  | "central-asia"
  | "turkiye"
  | "europe"
  | "asia"
  | "any";
export type StartYear = 2027 | 2028 | 2029;

export type EnglishCert =
  | { kind: "ielts"; band: number } // 4.0-9.0, step 0.5
  | { kind: "toefl"; score: number } // 0-120
  | { kind: "none" }
  | { kind: "planned" };

export interface Profile {
  grade: Grade; // required
  field: Field; // required
  gradeBand?: GradeBand;
  unt?: number; // 50-140 integer; undefined = not taken
  languages?: Partial<Record<Lang, LangLevel>>;
  englishCert?: EnglishCert;
  budget?: BudgetBand;
  regions?: Region[];
  startYear?: StartYear;
}

export const BUDGET_CEILING: Record<BudgetBand, number> = {
  "grant-only": 0,
  "under-1m": 1_000_000,
  "1-3m": 3_000_000,
  "3-6m": 6_000_000,
  "over-6m": Number.POSITIVE_INFINITY,
};

export const GRANT_TUITION_CEILING = 1_000_000; // ₸/year, demo assumption; not a universal state-grant policy

export type ProvenanceStatus = "verified" | "expected" | "demo";

export interface Provenance {
  status: ProvenanceStatus;
  sourceUrl?: string; // REQUIRED when status === 'verified'
  checkedOn?: string; // ISO 8601 date; REQUIRED when status === 'verified'
  basis?: string; // REQUIRED when status === 'expected'
}

export type Country = "KZ" | "TR" | "HU" | "PL" | "CZ" | "CN" | "MY" | "UZ";
export type Phase = "exams" | "documents" | "applications" | "activities";

export interface Deadline {
  label: string;
  date: string; // ISO 8601
  appliesTo: "exam" | "documents" | "application" | "result";
  provenance: Provenance;
}

export interface Program {
  id: string; // stable, kebab-case; used as tiebreak key
  university: string;
  city: string;
  country: Country;
  name: string;
  field: Field;
  adjacentFields: Field[];
  languages: Lang[];
  tuitionPerYear: number; // ₸/year, converted for non-KZ
  tuitionProvenance: Provenance;
  grantAvailable: boolean;
  grantCutoff: number | null; // UNT points; null when grantAvailable is false
  untCutoff: number; // typical competitive score
  cutoffProvenance: Provenance;
  grantCutoffProvenance?: Provenance; // set when grantCutoff has its own source
  requiresIelts: number | null; // minimum band
  deadlines: Deadline[];
  whyNotable: string; // one sentence, rendered on the card
}

export type DimensionKey =
  | "academic"
  | "financial"
  | "language"
  | "field"
  | "geography"
  | "timing";

export type Tier = "strong" | "realistic" | "stretch" | "notyet";

export interface DimensionScore {
  key: DimensionKey;
  score: number; // integer 0-100
  weight: number; // 0-1, post-adaptation
  reason: string; // non-empty, interpolates >= 1 numeric value
}

export interface MatchResult {
  program: Program;
  match: number; // integer 0-100
  tier: Tier;
  dimensions: DimensionScore[]; // always length 6, fixed order
  relaxed?: RelaxedFlag; // set by F17
  grantGap?: number; // ₸/year, set by F16 when > 0
}

export interface RelaxedFlag {
  dimension: DimensionKey;
  explanation: string;
}

export const TIER_BOUNDS: Record<Tier, [number, number]> = {
  strong: [75, 100],
  realistic: [55, 74],
  stretch: [35, 54],
  notyet: [0, 34],
};

export interface Task {
  id: string;
  phase: Phase;
  title: string;
  why: string; // one sentence rationale, required
  date: string; // ISO 8601, computed
  provenance: Provenance; // inherited from the anchoring deadline
  programId?: string; // set when program-specific
}

export interface TaskTemplate {
  id: string;
  phase: Phase;
  title: string;
  why: string;
  anchor:
    | "untWindowStart"
    | "documentsOpen"
    | "applicationDeadline"
    | "intakeStart"
    | "today";
  offsetDays: number; // negative = before anchor
  appliesIf: (p: Profile, m: MatchResult) => boolean;
}

export type TaskUrgency = "overdue" | "urgent" | "upcoming" | "done";

export interface Roadmap {
  phases: { phase: Phase; tasks: Task[]; completedCount: number }[];
  nextAction: Task | null;
}
