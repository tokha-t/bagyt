import { Profile, MatchResult, Roadmap, TaskTemplate, Phase } from "./types";
const always = () => true;
export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "unt-register",
    phase: "exams",
    title: "Check UNT registration",
    why: "Confirm the official exam window and your subject combination.",
    anchor: "untWindowStart",
    offsetDays: -45,
    appliesIf: (p, m) => m.program.country === "KZ",
  },
  {
    id: "unt-sit",
    phase: "exams",
    title: "Prepare for and sit UNT",
    why: "Your result helps you assess published entry requirements.",
    anchor: "untWindowStart",
    offsetDays: 0,
    appliesIf: (p, m) => m.program.country === "KZ",
  },
  {
    id: "ielts-book",
    phase: "exams",
    title: "Check and book an English test",
    why: "Confirm which certificates your selected program accepts.",
    anchor: "applicationDeadline",
    offsetDays: -120,
    appliesIf: (p, m) =>
      !!m.program.requiresIelts && p.englishCert?.kind !== "ielts",
  },
  {
    id: "ielts-sit",
    phase: "exams",
    title: "Complete your English test",
    why: "Leave time for results and a retake if needed.",
    anchor: "applicationDeadline",
    offsetDays: -75,
    appliesIf: (p, m) => !!m.program.requiresIelts,
  },
  {
    id: "transcript",
    phase: "documents",
    title: "Request your school transcript",
    why: "Ask your school how to obtain the required academic record.",
    anchor: "documentsOpen",
    offsetDays: -30,
    appliesIf: always,
  },
  {
    id: "id-passport",
    phase: "documents",
    title: "Check your identity document",
    why: "Check expiry dates and the name used on your application.",
    anchor: "documentsOpen",
    offsetDays: -60,
    appliesIf: always,
  },
  {
    id: "motivation-letter",
    phase: "documents",
    title: "Draft a motivation letter",
    why: "Prepare a draft if the university requests a statement.",
    anchor: "applicationDeadline",
    offsetDays: -60,
    appliesIf: (p, m) => m.program.country !== "KZ",
  },
  {
    id: "recommendation",
    phase: "documents",
    title: "Ask about a recommendation",
    why: "Give your teacher time if a reference is required.",
    anchor: "applicationDeadline",
    offsetDays: -90,
    appliesIf: (p, m) => m.program.country !== "KZ",
  },
  {
    id: "grant-documents",
    phase: "documents",
    title: "Confirm grant eligibility and documents",
    why: "A score threshold alone does not establish grant eligibility or coverage.",
    anchor: "documentsOpen",
    offsetDays: -14,
    appliesIf: (p, m) => p.budget === "grant-only" && m.program.grantAvailable,
  },
  {
    id: "university-application",
    phase: "applications",
    title: "Confirm the deadline and submit to the university",
    why: "Use the official admissions service once its dates are announced.",
    anchor: "applicationDeadline",
    offsetDays: -7,
    appliesIf: always,
  },
  {
    id: "portfolio-olympiad",
    phase: "activities",
    title: "Build one project in your chosen field",
    why: "A small project helps you explore whether the subject suits you.",
    anchor: "intakeStart",
    offsetDays: -240,
    appliesIf: always,
  },
  {
    id: "scholarship-application",
    phase: "applications",
    title: "Check scholarship applications",
    why: "Review each funding program’s eligibility and coverage separately.",
    anchor: "applicationDeadline",
    offsetDays: -21,
    appliesIf: (p) => p.budget === "grant-only",
  },
];
export function buildRoadmap(
  p: Profile,
  selected: MatchResult[],
  today: string,
  completed = new Set<string>(),
): Roadmap {
  const phases: Phase[] = ["exams", "documents", "applications", "activities"];
  const year = p.startYear ?? 2027;
  const tasks = selected
    .flatMap((m) => {
      const deadline = m.program.deadlines?.[0];
      const anchors = {
        intakeStart: `${year}-09-01`,
        untWindowStart: `${year}-05-16`,
        documentsOpen: `${year}-06-20`,
        applicationDeadline: deadline
          ? `${year}${deadline.date.slice(4)}`
          : `${year}-07-20`,
      };
      return TASK_TEMPLATES.filter((t) => t.appliesIf(p, m)).map((t) => {
        const d = new Date(`${anchors[t.anchor]}T12:00:00Z`);
        d.setUTCDate(d.getUTCDate() + t.offsetDays);
        return {
          id: `${m.program.id}:${year}:${t.id}`,
          phase: t.phase,
          title: t.title,
          why: t.why,
          date: d.toISOString().slice(0, 10),
          programId: m.program.id,
          provenance: {
            status: "expected" as const,
            basis: `Planning task ${Math.abs(t.offsetDays)} days ${t.offsetDays <= 0 ? "before" : "after"} the assumed ${year} ${t.anchor}; confirm official dates.`,
          },
        };
      });
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  void today;
  return {
    phases: phases.map((phase) => ({
      phase,
      tasks: tasks.filter((t) => t.phase === phase),
      completedCount: tasks.filter(
        (t) => t.phase === phase && completed.has(t.id),
      ).length,
    })),
    nextAction: tasks.find((t) => !completed.has(t.id)) ?? null,
  };
}
