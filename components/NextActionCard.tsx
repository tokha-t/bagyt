import { Task } from "@/lib/types";
import SourceBadge from "./SourceBadge";
export default function NextActionCard({
  task,
  onComplete,
}: {
  task: Task | null;
  onComplete: (id: string) => void;
}) {
  return (
    <section className="next-action">
      <p className="eyebrow">YOUR NEXT SMALL STEP</p>
      <h2>{task?.title ?? "You have completed your plan"}</h2>
      {task ? (
        <>
          <p>{task.why}</p>
          <p>
            Plan for <time dateTime={task.date}>{task.date}</time>
          </p>
          <SourceBadge provenance={task.provenance} />
          <button onClick={() => onComplete(task.id)}>
            Mark complete <span>✓</span>
          </button>
        </>
      ) : (
        <p>
          Revisit your university’s official dates as your intake approaches.
        </p>
      )}
    </section>
  );
}
