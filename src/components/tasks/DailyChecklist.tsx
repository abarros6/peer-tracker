import { format } from "date-fns";
import { TaskCheckbox } from "./TaskCheckbox";
import { isGoalActiveOnDate } from "@/lib/utils/days";
import type { Database } from "@/types/database";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

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
    <div className="space-y-3">
      {activeGoals.map((goal) => {
        const task = tasks.find(
          (t) => t.goal_id === goal.id && t.date === dateStr
        );
        return (
          <div key={goal.id} className="flex items-center gap-3">
            <TaskCheckbox
              goalId={goal.id}
              date={dateStr}
              initialCompleted={task?.completed ?? false}
            />
            <span className="text-sm">{goal.title}</span>
          </div>
        );
      })}
    </div>
  );
}
