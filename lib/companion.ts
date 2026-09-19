export type CompanionStage =
  | "profile"
  | "diagnostic"
  | "matches"
  | "compare"
  | "roadmap";

export const SUGGESTED: Record<CompanionStage, string[]> = {
  profile: [
    "Why do you need my UNT score?",
    "What if I haven't taken it?",
    "Do I have to answer everything?",
  ],
  diagnostic: ["How did you work this out?", "Can I change my answers?"],
  matches: [
    "What does a match percentage mean?",
    "Why is this one a stretch?",
    "What is a grant threshold?",
  ],
  compare: ["Which of these is cheaper overall?", "How many can I compare?"],
  roadmap: [
    "What should I do first?",
    "What is UNT registration?",
    "Are these dates official?",
  ],
};

const ANSWERS: Record<CompanionStage, [string, string][]> = {
  profile: [
    ["unt", "Your UNT score is the single strongest signal for domestic programmes: it decides both whether you can enter a competition and whether you would have won a grant. Skip it and the academic dimension falls back to your school GPA and carries less weight in the ranking — the journey still works end to end."],
    ["haven't|not taken|skip|don't have", "Nothing except your grade and field is required. Skip the UNT question and the academic dimension uses your school GPA instead, with a lighter weight. You can add a score later and watch the ranking change."],
    ["everything|all|required", "Only two answers are required: your grade and your field. Every other question has an explicit skip, and skipping costs you precision, not access."],
  ],
  diagnostic: [
    ["how|work|calculat", "Your answers are restated, not interpreted. The summary names the values you gave and the ones you left out, and says what each missing value would change. No model writes it — it is a template filled from your own inputs."],
    ["change|edit|answer", "Yes. Go back to the profile step, or edit any answer directly on the matches screen and watch the ranking move with a stated cause."],
  ],
  matches: [
    ["percent|%|match|84|score mean", "A match percentage is a weighted average of six dimension scores, each shown on the card with the numbers behind it. It is a fit score against named criteria, never a probability of admission — nobody can compute that honestly from public data."],
    ["stretch|tier|realistic|strong", "Tiers come from the match score: strong is 75 and above, realistic 55 to 74, stretch 35 to 54, and anything below 35 sits in the collapsed 'not yet' group with its binding reason shown."],
    ["grant threshold|cut-?off|grant", "Three different numbers get called 'the score you need'. The ministry threshold is the minimum to enter the competition; the passing score is what actually won a grant in a given year; a university's internal threshold is its own floor. Cards label which one they are showing, and any grant cut-off is the 2025 outcome, not a 2026 requirement."],
  ],
  compare: [
    ["cheap|cost|expensive|money", "Compare the tuition row: it is annual, in tenge, and the card says whether the figure is verified, expected or demo data. Where a grant would apply, the simulated gap is shown separately — a grant covering tuition is not the same as studying free."],
    ["how many|limit|three|four", "Two or three programmes at a time. A fourth is blocked with a stated reason, because a comparison you cannot read is not a comparison."],
  ],
  roadmap: [
    ["first|start|begin|next", "The pinned card at the top is your next action: the earliest unfinished task by date. Complete it and its successor is promoted immediately."],
    ["unt registration|ент|registration", "UNT registration is the application window for the national test, which opens well before the exam itself. The roadmap places it relative to your intake year — confirm the announced window with the national testing centre before relying on the date."],
    ["official|date|deadline|announced", "No. Every future date here is a planning assumption generated backwards from your intake year, and each one carries an expected badge with its basis. Announced 2027 deadlines do not exist yet."],
  ],
};

const FALLBACK: Record<CompanionStage, string> = {
  profile: "Only your grade and field are required — everything else can be skipped, and skipping costs precision rather than access. Ask me about the UNT question, the GPA scale or what happens when you leave something out.",
  diagnostic: "This page restates your own answers and names what is missing and why it matters. Ask me how it was worked out, or how to change an answer.",
  matches: "Each card is scored on six named dimensions with the arithmetic in view. Ask me what a match percentage means, why something is a stretch, or how grant thresholds differ.",
  compare: "Comparison holds two or three programmes and puts your highest-weighted dimensions first. Ask me about cost or the selection limit.",
  roadmap: "Your plan runs backwards from your intake year in four phases, with the nearest step pinned on top. Ask me what to do first, or whether these dates are official.",
};

export function cannedAnswer(stage: CompanionStage, question: string): string {
  const q = question.toLowerCase();
  for (const [pattern, answer] of ANSWERS[stage])
    if (new RegExp(pattern).test(q)) return answer;
  return FALLBACK[stage];
}

/**
 * Rejects any digit sequence the model invented. Mechanical guard, never the
 * prompt alone: a number may only appear in the answer if it is already in the
 * payload the page sent.
 */
export function passesFactGuard(text: string, visibleFacts: string): boolean {
  const allowed = new Set(visibleFacts.match(/\d+/g) ?? []);
  return (text.match(/\d+/g) ?? []).every((n) => allowed.has(n));
}
