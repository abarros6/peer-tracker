import { format, subDays } from "date-fns";
import { getGoals } from "@/lib/queries/goals";
import { getTasksForDateRange } from "@/lib/queries/tasks";
import { calculateStreak, calculateCompletionRate } from "@/lib/utils/streaks";
import { isGoalActiveOnDate } from "@/lib/utils/days";
import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { DailyChecklist } from "@/components/tasks/DailyChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const goals = await getGoals();
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const thirtyDaysAgo = format(subDays(today, 30), "yyyy-MM-dd");
  const tasks = await getTasksForDateRange(thirtyDaysAgo, todayStr);

  const todayGoals = goals.filter((g) =>
    isGoalActiveOnDate(today, g.recurrence, g.custom_days)
  );
  const todayCompleted = todayGoals.filter((g) =>
    tasks.some((t) => t.goal_id === g.id && t.date === todayStr && t.completed)
  ).length;

  const streaks = goals.map((g) => ({
    goal: g,
    streak: calculateStreak(g, tasks),
    rate: calculateCompletionRate(g, tasks),
  }));

  const longestStreak = streaks.length > 0
    ? Math.max(...streaks.map((s) => s.streak))
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
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyChecklist date={today} goals={goals} tasks={tasks} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Streaks</h3>
          {streaks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Create a goal to start tracking streaks.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {streaks.map(({ goal, streak, rate }) => (
                <StreakCard
                  key={goal.id}
                  title={goal.title}
                  streak={streak}
                  completionRate={rate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
