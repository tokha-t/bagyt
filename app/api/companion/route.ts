import { NextResponse } from "next/server";
import {
  cannedAnswer,
  passesFactGuard,
  CompanionStage,
  SUGGESTED,
} from "@/lib/companion";

export const runtime = "nodejs";

const TIMEOUT_MS = 5000;
const MODEL = process.env.COMPANION_MODEL ?? "gemini-2.5-flash";

function canned(stage: CompanionStage, question: string) {
  return NextResponse.json({
    text: cannedAnswer(stage, question),
    source: "canned" as const,
  });
}

async function callGemini(
  key: string,
  question: string,
  stage: CompanionStage,
  visibleFacts: string,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You are Vil, a small assistant inside a university planning tool for students in Kazakhstan. Answer in two or three sentences, in the language of the question. You may only restate figures that appear in FACTS; state no tuition, deadline, cut-off or statistic that is absent from it. Never express an admission probability, chance or guarantee. If the answer is not in FACTS, say you do not know and point at the badge on the card. Current stage: ${stage}.`,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                { text: `FACTS:\n${visibleFacts}\n\nQUESTION: ${question}` },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 200, temperature: 0.2 },
        }),
      },
    );
    if (!response.ok) throw new Error(`upstream ${response.status}`);
    const data = await response.json();
    const text: unknown = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) throw new Error("empty");
    return text.trim();
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let stage: CompanionStage = "matches";
  let question = "";
  try {
    const body = await request.json();
    if (typeof body?.stage === "string" && body.stage in SUGGESTED)
      stage = body.stage as CompanionStage;
    question = typeof body?.question === "string" ? body.question : "";
    const visibleFacts =
      typeof body?.visibleFacts === "string" ? body.visibleFacts : "";

    const key = process.env.GEMINI_API_KEY;
    if (!key) return canned(stage, question);

    const text = await callGemini(key, question, stage, visibleFacts);
    if (!passesFactGuard(text, visibleFacts)) return canned(stage, question);
    return NextResponse.json({ text, source: "ai" as const });
  } catch {
    return canned(stage, question);
  }
}
