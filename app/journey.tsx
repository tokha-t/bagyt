"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Profile,
  Grade,
  Field,
  GradeBand,
  BudgetBand,
  Region,
  StartYear,
  Lang,
  LangLevel,
  MatchResult,
} from "@/lib/types";
import {
  BUDGETS,
  FIELDS,
  REGIONS,
  LABELS,
  encodeProfile,
  decodeProfile,
  summary,
} from "@/lib/profile";
import { programs, DEMO, COMPUTED } from "@/lib/data";
import {
  rankPrograms,
  resolveWeights,
  scoreProgram,
  DIMENSIONS,
} from "@/lib/scoring";
import { buildRoadmap } from "@/lib/roadmap";
import { readCompleted, writeCompleted } from "@/lib/storage";
import ProgressRail from "@/components/ProgressRail";
import ChipSelect from "@/components/ChipSelect";
import ScoreSlider from "@/components/ScoreSlider";
import DiagnosticCard from "@/components/DiagnosticCard";
import MatchCard from "@/components/MatchCard";
import CompareStack from "@/components/CompareStack";
import NextActionCard from "@/components/NextActionCard";
import PhaseGroup from "@/components/PhaseGroup";
import EmptyState from "@/components/EmptyState";
import SourceBadge from "@/components/SourceBadge";
const routes = [
  "/",
  "/profile",
  "/diagnostic",
  "/matches",
  "/compare",
  "/roadmap",
  "/next-action",
];
const titles = [
  "",
  "A little about you.",
  "See your starting point.",
  "Find your direction.",
  "Make room for comparison.",
  "A plan you can follow.",
  "One step starts it.",
];
const sub = [
  "",
  "Nine questions. Skip what you don’t know yet.",
  "Your answers, reflected back.",
  "Explore the fit. Understand the trade-offs.",
  "Your highest-weighted priorities come first.",
  "Work backwards from your intended intake.",
  "Focus on the earliest unfinished task.",
];
const opts = (a: string[]) =>
  a.map((value) => ({ value, label: LABELS[value] ?? value }));
function ProfileQuestions({
  p,
  step,
  onChange,
  requiredMissing,
}: {
  p: Profile;
  step: number;
  onChange: (p: Profile, key: keyof Profile) => void;
  requiredMissing: string[];
}) {
  const set = <K extends keyof Profile>(key: K, v: Profile[K]) =>
    onChange({ ...p, [key]: v }, key);
  const skip = (key: keyof Profile) => set(key, undefined as never);
  return (
    <div className="questions">
      {step === 1 && (
        <>
          <fieldset>
            <legend>
              01 / What grade are you in? <span>Required</span>
            </legend>
            <ChipSelect
              options={opts(["9", "10", "11", "graduated"])}
              value={requiredMissing.includes("grade") ? null : String(p.grade)}
              mode="single"
              ariaLabel="Grade"
              onChange={(v) =>
                set(
                  "grade",
                  (v === "graduated" ? "graduated" : Number(v)) as Grade,
                )
              }
            />
          </fieldset>
          <fieldset>
            <legend>
              02 / What would you like to explore? <span>Required</span>
            </legend>
            <ChipSelect
              options={opts(FIELDS)}
              value={requiredMissing.includes("field") ? null : p.field}
              mode="single"
              ariaLabel="Field of study"
              onChange={(v) => set("field", v as Field)}
            />
          </fieldset>
          <fieldset>
            <legend>03 / How are your school grades?</legend>
            <ChipSelect
              options={opts(["excellent", "good", "average", "undisclosed"])}
              value={p.gradeBand ?? null}
              mode="single"
              ariaLabel="School grades"
              onChange={(v) => set("gradeBand", v as GradeBand)}
            />
            <button className="text-button" onClick={() => skip("gradeBand")}>
              Skip grades
            </button>
          </fieldset>
        </>
      )}
      {step === 2 && (
        <>
          <fieldset>
            <legend>04 / Have you taken the UNT?</legend>
            <ScoreSlider
              min={50}
              max={140}
              step={1}
              value={p.unt ?? null}
              onChange={(v) => set("unt", v ?? undefined)}
              hint={
                p.unt === undefined
                  ? "No score yet — you can still explore."
                  : `${programs.filter((r) => r.country === "KZ" && r.untCutoff <= (p.unt ?? 0)).length} dataset benchmarks reached (not eligibility).`
              }
            />
            <SourceBadge provenance={COMPUTED} />
          </fieldset>
          <fieldset>
            <legend>05 / Which languages can you study in?</legend>
            <div className="language-fields">
              {(["kk", "ru", "en"] as Lang[]).map((l) => (
                <label key={l}>
                  {LABELS[l]}
                  <select
                    value={p.languages?.[l] ?? ""}
                    onChange={(e) => {
                      const next = { ...p.languages };
                      if (e.target.value) next[l] = e.target.value as LangLevel;
                      else delete next[l];
                      set(
                        "languages",
                        Object.keys(next).length ? next : undefined,
                      );
                    }}
                  >
                    <option value="">Not specified</option>
                    <option value="basic">Basic</option>
                    <option value="working">Working</option>
                    <option value="fluent">Fluent</option>
                  </select>
                </label>
              ))}
            </div>
            <button className="text-button" onClick={() => skip("languages")}>
              Skip languages
            </button>
          </fieldset>
          <fieldset>
            <legend>06 / Do you have an English certificate?</legend>
            <ChipSelect
              options={opts(["none", "planned", "ielts", "toefl"])}
              value={p.englishCert?.kind ?? null}
              mode="single"
              ariaLabel="English certificate"
              onChange={(v) =>
                set(
                  "englishCert",
                  v === "ielts"
                    ? { kind: "ielts", band: 6.5 }
                    : v === "toefl"
                      ? { kind: "toefl", score: 90 }
                      : { kind: v as "none" | "planned" },
                )
              }
            />
            {p.englishCert?.kind === "ielts" && (
              <label>
                IELTS band
                <input
                  type="number"
                  min="4"
                  max="9"
                  step="0.5"
                  value={p.englishCert.band}
                  onChange={(e) => {
                    const n = +e.target.value;
                    if (n >= 4 && n <= 9 && (n * 2) % 1 === 0)
                      set("englishCert", { kind: "ielts", band: n });
                  }}
                />
              </label>
            )}
            {p.englishCert?.kind === "toefl" && (
              <label>
                TOEFL score
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={p.englishCert.score}
                  onChange={(e) => {
                    const n = +e.target.value;
                    if (n >= 0 && n <= 120 && Number.isInteger(n))
                      set("englishCert", { kind: "toefl", score: n });
                  }}
                />
              </label>
            )}
            <button className="text-button" onClick={() => skip("englishCert")}>
              Skip certificate
            </button>
          </fieldset>
        </>
      )}
      {step === 3 && (
        <>
          <fieldset>
            <legend>07 / What is your annual tuition budget?</legend>
            <ChipSelect
              options={opts(BUDGETS)}
              value={p.budget ?? null}
              mode="single"
              ariaLabel="Annual budget"
              onChange={(v) => set("budget", v as BudgetBand)}
            />
            <button className="text-button" onClick={() => skip("budget")}>
              Skip budget
            </button>
          </fieldset>
          <fieldset>
            <legend>08 / Where would you consider studying?</legend>
            <ChipSelect
              options={opts(REGIONS)}
              value={p.regions ?? []}
              mode="multi"
              ariaLabel="Study regions"
              onChange={(v) => set("regions", v as Region[])}
            />
            {p.regions?.includes("my-city") && (
              <p>
                We do not collect your city. This preference is treated as
                unspecified until you check each location.
              </p>
            )}
            <button className="text-button" onClick={() => skip("regions")}>
              Skip location
            </button>
          </fieldset>
          <fieldset>
            <legend>09 / When would you like to start?</legend>
            <ChipSelect
              options={opts(["2027", "2028", "2029"])}
              value={p.startYear ? String(p.startYear) : null}
              mode="single"
              ariaLabel="Start year"
              onChange={(v) => set("startYear", Number(v) as StartYear)}
            />
            <button className="text-button" onClick={() => skip("startYear")}>
              Skip start year
            </button>
          </fieldset>
        </>
      )}
    </div>
  );
}
function describe(v: unknown): string {
  return v === undefined
    ? "not specified"
    : typeof v === "object"
      ? JSON.stringify(v)
      : String(v);
}
export default function Journey({ today: initialToday }: { today: string }) {
  const [today, setToday] = useState(initialToday);
  useEffect(() => {
    const id = setTimeout(
      () =>
        setToday(
          new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Almaty",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date()),
        ),
      0,
    );
    return () => clearTimeout(id);
  }, []);
  const pathname = usePathname();
  const search = useSearchParams();
  const qs = search.toString();
  const p = decodeProfile(qs);
  const stage = (Math.max(0, routes.indexOf(pathname)) + 1) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7;
  const step = Math.max(1, Math.min(3, Number(search.get("step")) || 1));
  const [error, setError] = useState("");
  const [editStep, setEditStep] = useState(1);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [mutation, setMutation] = useState<{
    before: MatchResult[];
    text: string;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const cards = useRef<HTMLDivElement>(null);
  const positions = useRef<Map<string, number>>(new Map());
  const results = rankPrograms(p, programs, { today });
  const weights = resolveWeights(p);
  const priority = [...DIMENSIONS].sort((a, b) => weights[b] - weights[a]);
  const selectedIds = (search.get("sel") ?? "")
    .split(",")
    .filter((id) => programs.some((r) => r.id === id))
    .slice(0, 3);
  const selected = selectedIds.flatMap((id) => {
    const r = programs.find((r) => r.id === id);
    return r ? [scoreProgram(p, r, today)] : [];
  });
  const planId = search.get("plan");
  const planned = selected.length
    ? selected
    : [
        results.find((r) => r.program.id === planId) ??
          (programs.find((r) => r.id === planId)
            ? scoreProgram(
                p,
                programs.find(
                  (r) => r.id === planId,
                ) as (typeof programs)[number],
                today,
              )
            : results[0]),
      ].filter((r): r is MatchResult => !!r);
  const roadmap = buildRoadmap(p, planned, today, completed);
  const missing = [
    ...(!search.has("g") ? ["grade"] : []),
    ...(!search.has("f") ? ["field"] : []),
  ];
  useEffect(() => {
    const id = setTimeout(() => setCompleted(readCompleted()), 0);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!mutation) return;
    const id = setTimeout(() => setMutation(null), 4000);
    return () => clearTimeout(id);
  }, [mutation]);
  useLayoutEffect(() => {
    const nodes =
      cards.current?.querySelectorAll<HTMLElement>("[data-program]");
    const next = new Map<string, number>();
    nodes?.forEach((node) => {
      const id = node.dataset.program ?? "";
      const top = node.getBoundingClientRect().top;
      next.set(id, top);
      const prev = positions.current.get(id);
      if (
        prev !== undefined &&
        prev !== top &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        node.animate(
          [
            { transform: `translateY(${prev - top}px)` },
            { transform: "translateY(0)" },
          ],
          { duration: 320, easing: "ease-out" },
        );
    });
    positions.current = next;
  }, [qs]);
  function params(next = p) {
    const q = new URLSearchParams(encodeProfile(next));
    for (const key of ["sel", "plan", "step"]) {
      const v = search.get(key);
      if (v) q.set(key, v);
    }
    return q;
  }
  function go(path: string, q = params()) {
    setMutation(null);
    setError("");
    window.history.pushState(null, "", `${path}?${q.toString()}`);
    window.scrollTo({ top: 0 });
  }
  function update(next: Profile, key: keyof Profile) {
    setMutation({
      before: results,
      text: `${LABELS[key] ?? key} changed: ${describe(p[key])} → ${describe(next[key])}. ${key === "budget" ? "Cost fit and active weights were recalculated." : key === "grade" ? "Grade is reflected in your diagnostic; the numeric ranking uses your scores and preferences." : "Your fit scores were recalculated."}`,
    });
    setError("");
    const q = params(next);
    if (pathname === "/profile") {
      if (key !== "grade" && !search.has("g")) q.delete("g");
      if (key !== "field" && !search.has("f")) q.delete("f");
    }
    window.history.pushState(null, "", `${pathname}?${q}`);
  }
  function toggle(id: string) {
    setMutation(null);
    const next = new Set(completed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompleted(next);
    writeCompleted(next);
  }
  function select(id: string) {
    setMutation(null);
    if (!selectedIds.includes(id) && selectedIds.length === 3) {
      setNotice("Choose up to 3 programs. Remove one before adding another.");
      return;
    }
    setNotice("");
    const ids = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    const q = params();
    q.set("sel", ids.join(","));
    window.history.pushState(null, "", `${pathname}?${q}`);
  }
  function plan(id: string) {
    const q = params();
    q.set("plan", id);
    q.delete("sel");
    go("/roadmap", q);
  }
  function advance() {
    if (step === 1 && missing.length) {
      setError(
        `Choose ${missing.join(" and ")} before continuing. All other answers are optional.`,
      );
      return;
    }
    if (step < 3) {
      const q = params();
      q.set("step", String(step + 1));
      go("/profile", q);
    } else go("/diagnostic");
  }
  const dropped =
    mutation?.before.filter(
      (a) => !results.some((b) => a.program.id === b.program.id),
    ) ?? [];
  if (stage === 1)
    return (
      <main className="landing">
        <header className="brand">
          <span className="brand-mark">↗</span> bagyt
          <span className="brand-note">A direction of your own</span>
        </header>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
            <h1>
              A future that
              <br />
              feels like <em>you.</em>
            </h1>
            <p className="hero-intro">
              Turn what you know about yourself into university options — and
              one clear next step.
            </p>
            <button
              className="primary hero-cta"
              onClick={() => {
                window.history.pushState(null, "", "/profile");
                window.scrollTo({ top: 0 });
              }}
            >
              Find my direction <span>↗</span>
            </button>
            <p className="scope">
              For grades 9–11 in Kazakhstan. A planning guide using verified,
              expected and demo-labelled data.
            </p>
          </div>
          <div className="path-art" aria-hidden="true">
            <div className="orbit o1" />
            <div className="orbit o2" />
            <div className="orbit o3" />
            <div className="compass">↗</div>
            <span className="art-label l1">Your interests</span>
            <span className="art-label l2">Your options</span>
            <span className="art-label l3">Your next step</span>
          </div>
        </section>
        <footer className="landing-footer">
          <span>01 / Know yourself</span>
          <span>02 / Explore your fit</span>
          <span>03 / Take a step</span>
        </footer>
      </main>
    );
  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" onClick={() => go("/")}>
          <span className="brand-mark">↗</span> bagyt
        </button>
        <span className="brand-note">Your future, made manageable.</span>
      </header>
      <ProgressRail
        stage={stage}
        completed={Array.from({ length: stage - 1 }, (_, i) => i + 1)}
        onJump={(s) => go(routes[s - 1])}
      />
      <main className="content">
        <div className="page-heading">
          <p className="eyebrow">YOUR DIRECTION / 0{stage}</p>
          <h1>{titles[stage - 1]}</h1>
          <p>{sub[stage - 1]}</p>
        </div>
        {stage === 2 && (
          <section className="panel profile-panel">
            <div className="split">
              <span className="eyebrow">STEP {step} OF 3</span>
              <span>
                {
                  ["Your interests", "Your preparation", "Your possibilities"][
                    step - 1
                  ]
                }
              </span>
            </div>
            <ProfileQuestions
              p={p}
              step={step}
              onChange={update}
              requiredMissing={missing}
            />
            {error && (
              <p role="alert" className="notice">
                {error}
              </p>
            )}
            <div className="actions">
              {step > 1 ? (
                <button
                  onClick={() => {
                    const q = params();
                    q.set("step", String(step - 1));
                    go("/profile", q);
                  }}
                >
                  ← Back
                </button>
              ) : (
                <button className="text-button" onClick={() => go("/")}>
                  ← Home
                </button>
              )}
              <button className="primary" onClick={advance}>
                {step === 3 ? "See my picture" : "Continue"} →
              </button>
            </div>
          </section>
        )}
        {stage === 3 && (
          <>
            <DiagnosticCard
              text={summary(p)}
              source="template"
              loading={false}
              missingField={
                p.unt === undefined
                  ? {
                      field: "unt",
                      impact:
                        "Your UNT score replaces the provisional grade-based academic fit.",
                    }
                  : !p.budget
                    ? {
                        field: "budget",
                        impact:
                          "Your budget makes tuition trade-offs more specific.",
                      }
                    : undefined
              }
            />
            <div className="actions">
              <button onClick={() => go("/profile")}>Edit answers</button>
              <button className="primary" onClick={() => go("/matches")}>
                Explore my matches →
              </button>
            </div>
          </>
        )}
        {stage === 4 && (
          <>
            <section className="panel ranking-controls">
              <div className="split">
                <h2>Try a different possibility</h2>
                <span>Updates instantly</span>
              </div>
              <div className="quick-controls">
                <div>
                  <span>UNT score</span>
                  <ScoreSlider
                    min={50}
                    max={140}
                    step={1}
                    value={p.unt ?? null}
                    onChange={(v) =>
                      update({ ...p, unt: v ?? undefined }, "unt")
                    }
                    hint="Move the slider to explore academic fit."
                  />
                </div>
                <label>
                  Annual tuition budget
                  <select
                    value={p.budget ?? ""}
                    onChange={(e) =>
                      update(
                        {
                          ...p,
                          budget: (e.target.value || undefined) as
                            | BudgetBand
                            | undefined,
                        },
                        "budget",
                      )
                    }
                  >
                    <option value="">Not specified</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>
                        {LABELS[b]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <details>
                <summary>Edit all answers</summary>
                <div className="actions">
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      aria-pressed={editStep === s}
                      onClick={() => setEditStep(s)}
                    >
                      Step {s}
                    </button>
                  ))}
                </div>
                <ProfileQuestions
                  p={p}
                  step={editStep}
                  onChange={update}
                  requiredMissing={[]}
                />
              </details>
            </section>
            <p className="weight-line">
              Your strongest priorities:{" "}
              {priority
                .slice(0, 2)
                .map((k) => `${LABELS[k]} ${Math.round(weights[k] * 100)}%`)
                .join(" · ")}
              . <SourceBadge provenance={COMPUTED} />
            </p>
            <details className="assumptions">
              <summary>How to read your results</summary>
              <p>
                Fit scores compare your answers with this dataset. Prices marked
                Demo are illustrative. The grant calculation models a 1,000,000
                ₸ tuition cap as a demo assumption, not a general state-grant
                rule. Meeting a threshold does not establish funding
                eligibility. Tuition coverage excludes living costs.
                Foreign-program UNT benchmarks are illustrative proxies.
              </p>
              <SourceBadge provenance={DEMO} />
            </details>
            <div aria-live="polite" className="mutation-message">
              {mutation && (
                <>
                  <p>{mutation.text}</p>
                  {dropped.length > 0 && (
                    <p>
                      Left this shortlist:{" "}
                      {dropped.map((r) => r.program.name).join(", ")}.
                    </p>
                  )}
                </>
              )}
            </div>
            {results.some((r) => r.relaxed) && (
              <aside className="notice">
                <p>{results.find((r) => r.relaxed)?.relaxed?.explanation}</p>
                <button
                  onClick={() => {
                    const dim = results.find((r) => r.relaxed)?.relaxed
                      ?.dimension;
                    if (dim === "geography")
                      update({ ...p, regions: ["any"] }, "regions");
                    else if (dim === "field")
                      update({ ...p, field: "undecided" }, "field");
                    else update({ ...p, budget: "over-6m" }, "budget");
                  }}
                >
                  Widen this preference
                </button>
              </aside>
            )}
            <div ref={cards} className="matches">
              {results.map((r) => {
                const old = mutation?.before.find(
                  (a) => a.program.id === r.program.id,
                );
                return (
                  <div key={r.program.id} data-program={r.program.id}>
                    <MatchCard
                      result={r}
                      selected={selectedIds.includes(r.program.id)}
                      onToggleSelect={select}
                      onOpen={plan}
                      delta={
                        old && Math.abs(old.match - r.match) > 5
                          ? { from: old.match, to: r.match }
                          : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>
            <details className="panel excluded">
              <summary>Not yet — options that need more preparation</summary>
              {programs
                .map((r) => scoreProgram(p, r, today))
                .filter((r) => r.match < 35)
                .map((r) => (
                  <p key={r.program.id}>
                    {r.program.name}:{" "}
                    {
                      r.dimensions.toSorted(
                        (a, b) => a.score * a.weight - b.score * b.weight,
                      )[0].reason
                    }{" "}
                    <SourceBadge provenance={COMPUTED} />
                  </p>
                ))}
              {programs.every((r) => scoreProgram(p, r, today).match >= 35) && (
                <p>
                  No programs fall below the 35-point band for these answers.
                  Adjust your profile above to explore other constraints.{" "}
                  <SourceBadge provenance={COMPUTED} />
                </p>
              )}
            </details>
            {notice && (
              <p role="alert" className="notice">
                {notice}
              </p>
            )}
            <div className="sticky-actions">
              <button
                onClick={() =>
                  selected.length >= 2
                    ? go("/compare")
                    : setNotice("Select at least 2 programs to compare.")
                }
              >
                Compare ({selected.length}/3)
              </button>
              <button className="primary" onClick={() => go("/next-action")}>
                My next action →
              </button>
            </div>
          </>
        )}
        {stage === 5 && (
          <>
            {selected.length < 2 ? (
              <EmptyState
                title="Choose two paths to compare"
                reason="Your comparison needs 2 or 3 selected programs."
                action={{
                  label: "Choose programs",
                  onClick: () => go("/matches"),
                }}
              />
            ) : (
              <>
                <CompareStack results={selected} priorityOrder={priority} />
                <div className="actions">
                  <button onClick={() => go("/matches")}>
                    Change selection
                  </button>
                  <button className="primary" onClick={() => go("/roadmap")}>
                    Build my plan →
                  </button>
                </div>
              </>
            )}
            <button className="text-button" onClick={() => go("/next-action")}>
              Go to my next action →
            </button>
          </>
        )}
        {stage === 6 && (
          <>
            <div className="panel plan-context">
              <p>
                Planning for {p.startYear ?? 2027} ·{" "}
                {planned.map((r) => r.program.name).join(", ")}{" "}
                <SourceBadge provenance={COMPUTED} />
              </p>
              <label>
                Change intake
                <select
                  value={p.startYear ?? 2027}
                  onChange={(e) =>
                    update(
                      { ...p, startYear: +e.target.value as StartYear },
                      "startYear",
                    )
                  }
                >
                  {[2027, 2028, 2029].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </label>
              <p>
                These are preparation dates. Verify announced deadlines with
                each university.
              </p>
            </div>
            <NextActionCard task={roadmap.nextAction} onComplete={toggle} />
            <div className="phases">
              {roadmap.phases.map((group) => (
                <PhaseGroup
                  key={group.phase}
                  phase={group.phase}
                  tasks={group.tasks}
                  completedIds={completed}
                  onToggle={toggle}
                  today={today}
                />
              ))}
            </div>
            <div className="actions">
              <button onClick={() => go("/matches")}>Change program</button>
              <button className="primary" onClick={() => go("/next-action")}>
                Focus on next action →
              </button>
            </div>
          </>
        )}
        {stage === 7 && (
          <>
            <NextActionCard task={roadmap.nextAction} onComplete={toggle} />
            <p className="completion-note" aria-live="polite">
              {roadmap.phases.reduce((a, g) => a + g.completedCount, 0)} of{" "}
              {roadmap.phases.reduce((a, g) => a + g.tasks.length, 0)} planning
              tasks complete.
            </p>
            <div className="actions">
              <button onClick={() => go("/roadmap")}>
                See the full roadmap
              </button>
              <button className="text-button" onClick={() => go("/matches")}>
                Revisit my options
              </button>
            </div>
          </>
        )}
      </main>
      <footer className="app-footer">
        Bagyt · A direction of your own.
        <span>Check official requirements before acting.</span>
      </footer>
    </div>
  );
}
