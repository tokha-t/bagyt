import { Task, TaskUrgency } from "@/lib/types";
import SourceBadge from "./SourceBadge";

const LABEL: Record<TaskUrgency, string> = {
  overdue: "Overdue",
  urgent: "left",
  upcoming: "",
  done: "Done",
};

export default function TaskRow({
  task,
  completed,
  urgency,
  daysLeft,
  onToggle,
}: {
  task: Task;
  completed: boolean;
  urgency: TaskUrgency;
  daysLeft: number;
  onToggle: (id: string) => void;
}) {
  const state =
    urgency === "urgent"
      ? `${daysLeft === 0 ? "Today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`} ${LABEL.urgent}`
      : LABEL[urgency];
  return (
    <article className={`task ${completed ? "completed" : ""}`} data-urgency={urgency}>
      <label>
        <input
          type="checkbox"
          checked={completed}
          onChange={() => onToggle(task.id)}
        />
        <span>
          <strong>{task.title}</strong>
          <small>
            {task.date}
            {state ? (
              <b className={`urgency urgency-${urgency}`}>
                {urgency === "done" ? "✓ " : ""}
                {state}
              </b>
            ) : null}
          </small>
        </span>
      </label>
      <p>{task.why}</p>
      <SourceBadge provenance={task.provenance} />
    </article>
  );
}
