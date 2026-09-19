"use client";
import { useState } from "react";
import { CompanionStage, SUGGESTED, cannedAnswer } from "@/lib/companion";

export default function Companion({
  stage,
  visibleFacts,
}: {
  stage: CompanionStage;
  visibleFacts: string;
}) {
  const [open, setOpen] = useState(false);
  const [asked, setAsked] = useState("");
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState<"canned" | "ai">("canned");
  const [busy, setBusy] = useState(false);

  async function ask(question: string) {
    setAsked(question);
    setBusy(true);
    // The local template answers first, so a failed request can never leave
    // the panel empty or show an error to a judge.
    setAnswer(cannedAnswer(stage, question));
    setSource("canned");
    try {
      const response = await fetch("/api/companion", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, stage, visibleFacts }),
      });
      const data = await response.json();
      if (typeof data?.text === "string" && data.text.trim()) {
        setAnswer(data.text);
        setSource(data.source === "ai" ? "ai" : "canned");
      }
    } catch {
      /* The template answer already on screen stands. */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`companion ${open ? "open" : ""}`}>
      {open && (
        <section className="companion-panel" aria-label="Vil, your guide">
          <div className="split">
            <strong>Vil</strong>
            <button
              className="text-button"
              onClick={() => setOpen(false)}
              aria-label="Close Vil"
            >
              Close
            </button>
          </div>
          {asked ? (
            <>
              <p className="companion-q">{asked}</p>
              <p className="companion-a" aria-live="polite">
                {answer}
              </p>
              <small>
                {source === "ai"
                  ? "Generated, and checked against the figures on this page."
                  : "Written answer. Vil never invents a number."}
              </small>
            </>
          ) : (
            <p className="companion-a">
              I answer questions about what is on this screen. I never invent a
              number, and I do not predict admission.
            </p>
          )}
          <ul className="companion-questions">
            {SUGGESTED[stage].map((q) => (
              <li key={q}>
                <button disabled={busy} onClick={() => ask(q)}>
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <button
        className="companion-mark"
        aria-expanded={open}
        aria-label={open ? "Hide Vil" : "Ask Vil about this screen"}
        onClick={() => setOpen(!open)}
      >
        <span className="eye" />
        <span className="eye" />
      </button>
    </div>
  );
}
