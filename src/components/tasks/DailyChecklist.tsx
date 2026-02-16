import { format } from "date-fns";
import { TaskCheckbox } from "./TaskCheckbox";
import { isGoalActiveOnDate } from "@/lib/utils/days";
import type { Database } from "@/types/database";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

const rowColors = [
  "bg-rose-50/60 dark:bg-rose-900/10",
  "bg-sky-50/60 dark:bg-sky-900/10",
  "bg-amber-50/60 dark:bg-amber-900/10",
  "bg-violet-50/60 dark:bg-violet-900/10",
  "bg-emerald-50/60 dark:bg-emerald-900/10",
  "bg-orange-50/60 dark:bg-orange-900/10",
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

  return (
    <div className="space-y-2">
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
