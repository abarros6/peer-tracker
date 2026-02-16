import { format, subDays, addDays } from "date-fns";
import { getGoals } from "@/lib/queries/goals";
import { getTasksForDateRange } from "@/lib/queries/tasks";
import { calculateStreak, calculateCompletionRate } from "@/lib/utils/streaks";
import { isGoalActiveOnDate } from "@/lib/utils/days";
import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { TaskCalendarPage } from "@/components/tasks/TaskCalendarPage";

export default async function DashboardPage() {
  const goals = await getGoals();
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const sixtyDaysAgo = format(subDays(today, 60), "yyyy-MM-dd");
  const thirtyDaysAhead = format(addDays(today, 30), "yyyy-MM-dd");
  const tasks = await getTasksForDateRange(sixtyDaysAgo, thirtyDaysAhead);

  const todayGoals = goals.filter((g) =>
    isGoalActiveOnDate(today, g.recurrence, g.custom_days)
  );
  const todayCompleted = todayGoals.filter((g) =>
    tasks.some((t) => t.goal_id === g.id && t.date === todayStr && t.completed)
  ).length;

  const longestStreak = goals.length > 0
    ? Math.max(...goals.map((g) => calculateStreak(g, tasks)))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <OverviewStats
        totalGoals={goals.length}
        todayCompleted={todayCompleted}
        todayTotal={todayGoals.length}
        longestStreak={longestStreak}
        compact
      />

      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Create a goal to see your calendar.
        </p>
      ) : (
        <TaskCalendarPage goals={goals} tasks={tasks} />
      )}
    </div>
  );
}
