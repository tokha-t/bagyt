import { Phase, Task } from "@/lib/types";
import { urgencyOf, daysUntil } from "@/lib/roadmap";
import TaskRow from "./TaskRow";
import Mark from "./Mark";
export default function PhaseGroup({
  phase,
  tasks,
  completedIds,
  onToggle,
  today,
}: {
  phase: Phase;
  tasks: Task[];
  completedIds: Set<string>;
  onToggle: (id: string) => void;
  today: string;
}) {
  return (
    <section className="phase panel">
      <div className="split">
        <h2>
          <Mark name={phase} /> {phase}
        </h2>
        <span>
          {tasks.filter((t) => completedIds.has(t.id)).length} / {tasks.length}{" "}
          done
        </span>
      </div>
      {tasks.length ? (
        tasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            completed={completedIds.has(t.id)}
            urgency={urgencyOf(t, completedIds.has(t.id), today)}
            daysLeft={daysUntil(t.date, today)}
            onToggle={onToggle}
          />
        ))
      ) : (
        <p>
          No {phase} tasks apply. Change your chosen program to explore another
          plan.
        </p>
      )}
    </section>
  );
}
