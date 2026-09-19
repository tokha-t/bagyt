import SourceBadge from "./SourceBadge";
import Mark, { MarkWall, DIMENSION_MARKS } from "./Mark";
import { LABELS } from "@/lib/profile";
import { DEMO } from "@/lib/data";
import facts from "@/data/facts.json";
import { Provenance } from "@/lib/types";

const STAGES: { mark: Parameters<typeof Mark>[0]["name"]; title: string; body: string }[] = [
  { mark: "field", title: "Tell us where you stand", body: "Nine questions in three steps. Only your grade and field are required." },
  { mark: "academic", title: "See your starting point", body: "Your answers restated as strengths, constraints and a goal." },
  { mark: "financial", title: "Get ranked programmes", body: "Every programme scored on six named dimensions, with the arithmetic shown." },
  { mark: "geography", title: "Compare side by side", body: "Two or three programmes, highest-weighted dimensions first." },
  { mark: "timing", title: "Work backwards from intake", body: "A dated plan in four phases, generated from your chosen year." },
  { mark: "language", title: "Act on one step", body: "The nearest unfinished task stays pinned to the top of the plan." },
];

const FAQ: [string, string][] = [
  ["Is this official?", "No. Vilion is an independent planning tool, not a university or a government service. Every figure that comes from an official source links to it."],
  ["Do you guarantee admission?", "No, and we never show an admission probability or a chance of any kind. Nobody can compute one honestly from the data that exists publicly, so we show fit against named criteria instead and let you judge."],
  ["Where does the data come from?", "The Ministry of Science and Higher Education, the national testing centre and university admissions pages. Every figure carries a badge saying whether it is verified, expected or demo data."],
  ["Do I need an account?", "No. The whole six-stage journey works without one, and nothing is behind a login or a payment. Your progress is kept in this browser."],
  ["Is it free?", "Yes, entirely."],
  ["What if my programme is missing?", "There are 36 programmes today, chosen to cover eleven fields and both domestic and overseas routes. The dataset is a checked-in JSON file, so adding a programme means adding a row with its sources."],
];

function Stat({ value, label, provenance }: { value: string; label: string; provenance: Provenance }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <p>{label}</p>
      <SourceBadge provenance={provenance as Provenance} />
    </div>
  );
}

export default function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main className="landing">
      <MarkWall />
      <header className="brand">
        <span className="brand-mark">↗</span> vilion
        <span className="brand-note">See where you fit</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">VILION</p>
          <h1>
            see where
            <br />
            you <em>fit.</em>
          </h1>
          <p className="hero-intro">
            For students in grades 9–11 in Kazakhstan, choosing between programmes
            here and abroad — turn what you know about yourself into ranked
            options and one clear next step.
          </p>
          <button className="primary hero-cta" onClick={onStart}>
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
        <p className="scroll-cue" aria-hidden="true">
          more below ↓
        </p>
      </section>

      <section className="strip alt" id="problem">
        <h2>The numbers a student is choosing inside</h2>
        <div className="stats">
          <Stat
            value="75 371"
            label="bachelor state grants for 2026–27"
            provenance={facts.bachelorGrants2026.provenance as Provenance}
          />
          <Stat
            value="60%"
            label="of those grants directed to engineering and technical fields, leaving the rest to everything else"
            provenance={facts.grantDirectionShare2026.provenance as Provenance}
          />
          <Stat
            value="140"
            label="maximum UNT score — and three different thresholds that get called “the score you need”"
            provenance={facts.untMaximumScore.provenance as Provenance}
          />
        </div>
        <p className="strip-note">
          The middle one decides more than most students realise: the field you
          choose moves your grant odds before your score does.{" "}
          <SourceBadge
            provenance={facts.grantDirectionShare2026.provenance as Provenance}
          />
        </p>
      </section>

      <section className="strip" id="what-you-get">
        <h2>What you get</h2>
        <div className="stage-grid">
          {STAGES.map((s, i) => (
            <article className="stage-card" key={s.title}>
              <Mark name={s.mark} />
              <p className="eyebrow">0{i + 1}</p>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="strip alt" id="how-it-works">
        <h2>How it works</h2>
        <p className="lede">
          Every recommendation is scored on six named dimensions, and shows you
          the arithmetic.
        </p>
        <ul className="dimension-row">
          {DIMENSION_MARKS.map((k) => (
            <li key={k}>
              <Mark name={k} />
              <span>{LABELS[k]}</span>
            </li>
          ))}
        </ul>
        <p className="claim">No black box, no admission promises.</p>
      </section>

      <section className="strip" id="honesty">
        <h2>Where each number comes from</h2>
        <p className="lede">
          Most of this data is verified against government and university
          sources. Where it is not, we say so — on the card, not in the
          footnotes.
        </p>
        <div className="badge-row">
          <div>
            <SourceBadge
              provenance={{
                status: "verified",
                sourceUrl: "https://www.gov.kz",
                checkedOn: facts.checkedOn,
              }}
            />
            <p>A published source, linked, with the date it was checked.</p>
          </div>
          <div>
            <SourceBadge
              provenance={{
                status: "expected",
                basis: "a stated basis you can judge",
              }}
            />
            <p>An inference or an aggregator figure, with its basis in view.</p>
          </div>
          <div>
            <SourceBadge provenance={DEMO} />
            <p>Illustrative data, labelled as such wherever it appears.</p>
          </div>
        </div>
      </section>

      <section className="strip alt" id="faq">
        <h2>Six questions</h2>
        <div className="faq">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="strip final-cta">
        <h2>Nine questions. One clear next step.</h2>
        <button className="primary" onClick={onStart}>
          Find my direction <span>↗</span>
        </button>
      </section>

      <footer className="landing-footer">
        <span>01 / Know yourself</span>
        <span>02 / Explore your fit</span>
        <span>03 / Take a step</span>
      </footer>
    </main>
  );
}
