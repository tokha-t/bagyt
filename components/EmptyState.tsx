export default function EmptyState({
  title,
  reason,
  action,
}: {
  title: string;
  reason: string;
  action: { label: string; onClick: () => void };
}) {
  return (
    <section className="panel empty">
      <h2>{title}</h2>
      <p>{reason}</p>
      <button onClick={action.onClick}>{action.label}</button>
    </section>
  );
}
