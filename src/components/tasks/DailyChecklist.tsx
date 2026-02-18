import { format } from "date-fns";
import { TaskCheckbox } from "./TaskCheckbox";
import { isGoalActiveOnDate } from "@/lib/utils/days";
import type { Database } from "@/types/database";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

const rowColors = [
  "bg-amber-50/70 dark:bg-amber-900/15",
  "bg-sky-50/70 dark:bg-sky-900/15",
  "bg-teal-50/70 dark:bg-teal-900/15",
  "bg-indigo-50/70 dark:bg-indigo-900/15",
  "bg-violet-50/60 dark:bg-violet-900/15",
  "bg-rose-50/60 dark:bg-rose-900/15",
];

export function DailyChecklist({
  date,
  goals,
  tasks,
}: {
  date: Date;
  goals: Goal[];
  tasks: Task[];
}) {
  const dateStr = format(date, "yyyy-MM-dd");
  const activeGoals = goals.filter((g) =>
    isGoalActiveOnDate(date, g.recurrence, g.custom_days)
  );

  if (activeGoals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No goals for this day.</p>
    );
  }

  const allDone =
    activeGoals.length > 0 &&
    activeGoals.every((g) =>
      tasks.some((t) => t.goal_id === g.id && t.date === dateStr && t.completed)
    );

  return (
    <div className="space-y-2">
      {allDone && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2.5 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          <span className="text-base">✓</span>
          <span className="text-sm font-semibold">All done for today!</span>
        </div>
      )}
      {activeGoals.map((goal, i) => {
        const task = tasks.find(
          (t) => t.goal_id === goal.id && t.date === dateStr
        );
        return (
          <div
            key={goal.id}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${rowColors[i % rowColors.length]}`}
          >
            <TaskCheckbox
              goalId={goal.id}
              date={dateStr}
              initialCompleted={task?.completed ?? false}
            />
            <span className="text-sm font-medium">{goal.title}</span>
          </div>
        );
      })}
    </div>
  );
}
