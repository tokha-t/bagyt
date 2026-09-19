"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MarkWall } from "./Mark";
import Mark from "./Mark";
import SourceBadge from "./SourceBadge";
import { COMPUTED, programs, money } from "@/lib/data";
import { encodeProfile, summary } from "@/lib/profile";
import { readSession, clearSession, SavedSession, describeVersion } from "@/lib/session";
import { readCompleted, writeCompleted } from "@/lib/storage";
import { rankPrograms, REFERENCE_DATE } from "@/lib/scoring";
import { buildRoadmap } from "@/lib/roadmap";
import NextActionCard from "./NextActionCard";
import PhaseGroup from "./PhaseGroup";

export default function Cabinet() {
  const [session, setSession] = useState<SavedSession | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [today, setToday] = useState(REFERENCE_DATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Deferred a tick for the same reason as the journey's storage read: the
    // store is only available on the client.
    const id = setTimeout(() => {
      setSession(readSession());
      setCompleted(readCompleted());
      setToday(
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Almaty",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date()),
      );
      setLoaded(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (!loaded)
    return (
      <main className="content skeleton">
        <p>Opening your saved plan…</p>
      </main>
    );

  if (!session)
    return (
      <main className="content cabinet">
        <h1>Nothing saved in this browser yet</h1>
        <p>
          Vilion works without saving anything. When you reach the end of your
          roadmap you can keep a copy here — in this browser, on this device,
          with no account and no sign-in.
        </p>
        <div className="actions">
          <Link className="primary" href="/profile">
            Start the journey
          </Link>
          <Link className="text-button" href="/">
            Back to the landing page
          </Link>
        </div>
      </main>
    );

  const latest = session.history.at(-1);
  const profile = latest?.profile;
  const selected = profile
    ? (() => {
        const ranked = rankPrograms(profile, programs, { today });
        const saved = session.shortlist
          .map((s) => ranked.find((m) => m.program.id === s.programId))
          .filter((m): m is (typeof ranked)[number] => Boolean(m));
        return saved.length ? saved : ranked.slice(0, 2);
      })()
    : [];
  const roadmap = profile
    ? buildRoadmap(profile, selected, today, completed)
    : null;

  function toggle(id: string) {
    const next = new Set(completed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompleted(next);
    writeCompleted(next);
  }

  return (
    <main className="content cabinet">
      <header className="cabinet-header panel">
        <MarkWall id="cabinetwall" />
        <div>
          <p className="eyebrow">SAVED IN THIS BROWSER</p>
          <h1>{session.displayName?.trim() || "Your plan"}</h1>
          {profile ? <p>{summary(profile)}</p> : null}
          <p className="hint">
            Saved {new Date(session.createdAt).toISOString().slice(0, 10)}. This
            is a browser key, not an account: clearing site data removes it, and
            it does not follow you to another device.
          </p>
          {profile ? (
            <Link className="primary" href={`/roadmap?${encodeProfile(profile)}`}>
              Resume this plan →
            </Link>
          ) : null}
        </div>
      </header>

      {roadmap ? (
        <NextActionCard task={roadmap.nextAction} onComplete={toggle} />
      ) : null}

      {roadmap ? (
        <section className="panel">
          <h2>
            <Mark name="documents" /> Saved plan
          </h2>
          <p className="hint">
            The same roadmap, with the tasks you have already marked complete.
            Toggling one here changes it everywhere.
          </p>
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
        </section>
      ) : null}

      <section className="panel">
        <h2>
          <Mark name="applications" /> Shortlist
        </h2>
        {session.shortlist.length ? (
          <ul className="cabinet-list">
            {session.shortlist.map((s) => {
              const program = programs.find((r) => r.id === s.programId);
              return (
                <li key={s.programId}>
                  <strong>{program ? program.name : s.programId}</strong>
                  <span>
                    {program ? `${program.university} · ${money(program.tuitionPerYear)}/yr` : ""}
                  </span>
                  <span>
                    {s.matchAtSave}/100 when saved on {s.savedAt.slice(0, 10)}
                  </span>
                  <SourceBadge provenance={COMPUTED} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p>
            No programmes were selected when this plan was saved. Open the
            matches stage and choose two or three to compare.
          </p>
        )}
      </section>

      <section className="panel">
        <h2>
          <Mark name="timing" /> History
        </h2>
        <p className="hint">
          Every time your answers changed, what changed and how the shortlist
          moved.
        </p>
        <ol className="cabinet-history">
          {session.history.map((v, i) => (
            <li key={v.at}>
              <time dateTime={v.at}>{v.at.slice(0, 16).replace("T", " ")}</time>
              <strong>{describeVersion(v, session.history[i - 1])}</strong>
              <span>
                Top: {v.topMatchIds.slice(0, 3).map((id) => programs.find((r) => r.id === id)?.name ?? id).join(", ") || "—"}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h2>
          <Mark name="exams" /> Completed tasks
        </h2>
        <p>
          {completed.size} task{completed.size === 1 ? "" : "s"} marked complete
          in this browser.
        </p>
      </section>

      <div className="actions">
        <Link className="text-button" href="/roadmap">
          Back to the roadmap
        </Link>
        <button
          className="text-button"
          onClick={() => {
            clearSession();
            setSession(null);
          }}
        >
          Delete this saved plan
        </button>
      </div>
    </main>
  );
}
