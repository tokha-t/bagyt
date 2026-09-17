export default function DeltaChip({ from, to }: { from: number; to: number }) {
  return (
    <span className="delta">
      {to > from ? "↑" : "↓"} {from} → {to}
    </span>
  );
}
