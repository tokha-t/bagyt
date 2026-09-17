import { MatchResult } from "@/lib/types";
import { money, DEMO, COMPUTED } from "@/lib/data";
import SourceBadge from "./SourceBadge";
import TierBadge from "./TierBadge";
import DeltaChip from "./DeltaChip";
import DimensionBar from "./DimensionBar";
export default function MatchCard({
  result: r,
  delta,
  selected,
  onToggleSelect,
  onOpen,
}: {
  result: MatchResult;
  delta?: { from: number; to: number };
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <article className="match-card panel">
      <div className="match-head">
        <div>
          <p className="eyebrow">
            {r.program.university} <SourceBadge provenance={DEMO} />
          </p>
          <h2>{r.program.name}</h2>
          <SourceBadge provenance={DEMO} />
          <p>
            {r.program.city} · {r.program.country}{" "}
            <SourceBadge provenance={DEMO} />
          </p>
        </div>
        <div className="match-score">
          <strong>{r.match}</strong>
          <span>/100 fit</span>
        </div>
      </div>
      <SourceBadge provenance={COMPUTED} />
      <div className="split">
        <TierBadge tier={r.tier} />
        <div className="delta-slot">{delta && <DeltaChip {...delta} />}</div>
      </div>
      {r.relaxed && (
        <p className="notice">Widened option · {r.relaxed.explanation}</p>
      )}
      <p>
        {r.program.whyNotable} <SourceBadge provenance={DEMO} />
      </p>
      <div className="facts">
        <p>
          <strong>{money(r.program.tuitionPerYear)}</strong> / year{" "}
          <SourceBadge provenance={r.program.tuitionProvenance} />
        </p>
        <p>
          UNT reference: {r.program.untCutoff}{" "}
          <SourceBadge provenance={r.program.cutoffProvenance} />
          <small>
            {r.program.cutoffProvenance.status === "verified"
              ? "Published grant participation threshold; not a competitive result."
              : "Illustrative benchmark."}
          </small>
        </p>
        {r.grantGap !== undefined && (
          <p>
            Simulated annual tuition gap: {money(r.grantGap)}{" "}
            <SourceBadge provenance={DEMO} />
          </p>
        )}
      </div>
      <div className="dimensions">
        {r.dimensions.map((d) => (
          <DimensionBar key={d.key} dimension={d} tier={r.tier} />
        ))}
      </div>
      <div className="actions">
        <button
          aria-pressed={selected}
          className={selected ? "selected" : ""}
          onClick={() => onToggleSelect(r.program.id)}
        >
          {selected ? "✓ Selected" : "＋ Compare"}
        </button>
        <button className="text-button" onClick={() => onOpen(r.program.id)}>
          Plan this option →
        </button>
      </div>
    </article>
  );
}
