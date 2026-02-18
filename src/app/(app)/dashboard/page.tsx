import { format, subDays, addDays } from "date-fns";
import { getGoals } from "@/lib/queries/goals";
import { getTasksForDateRange } from "@/lib/queries/tasks";
import { calculateStreak } from "@/lib/utils/streaks";
import { isGoalActiveOnDate } from "@/lib/utils/days";
import { getTodayConfirmationCount, getMyConfirmationsForTasks } from "@/lib/queries/confirmations";
import { getCurrentProfile } from "@/lib/queries/auth";
import { getFriendsWithTodayProgress } from "@/lib/queries/friends";
import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { TaskCalendarPage } from "@/components/tasks/TaskCalendarPage";
import { FriendsTodaySection } from "@/components/dashboard/FriendsTodaySection";

function pick(arr: string[], date: Date): string {
  return arr[date.getDate() % arr.length];
}

function getStreakGreeting(streak: number, name: string | null, date: Date): string {
  const n = name ? `, ${name}` : "";

  if (streak === 0) {
    return pick([
      `Let's get it${n}.`,
      `Fresh start${n}.`,
      `Today's the day${n}.`,
      `Ready when you are${n}.`,
    ], date);
  }

  if (streak === 1) {
    return pick([
      `Day one down${n}. Keep it rolling.`,
      `First day done${n}. Don't look back.`,
      `One down${n}. Build on it.`,
    ], date);
  }

  if (streak <= 3) {
    return pick([
      `You're building something${n}.`,
      `Early days, keep going${n}.`,
      `Two days in a row${n}. Stay consistent.`,
      `Small streaks become big ones${n}.`,
    ], date);
  }

  if (streak <= 6) {
    return pick([
      `Kill it${n}.`,
      `You've got momentum${n}.`,
      `Stay sharp${n}.`,
      `Don't break the chain${n}.`,
      `${streak} days in${n}. Keep pushing.`,
    ], date);
  }

  if (streak <= 13) {
    return pick([
      `One week strong${n}!`,
      `${streak} days and counting${n}!`,
      `You're locked in${n}.`,
      `A full week of showing up${n}!`,
      `Consistency is your superpower${n}.`,
    ], date);
  }

  if (streak <= 20) {
    return pick([
      `Two weeks straight${n}. Unstoppable.`,
      `You can't be stopped${n}!`,
      `${streak} days${n}. You're a machine.`,
      `Locked in and locked down${n}!`,
    ], date);
  }

  if (streak <= 29) {
    return pick([
      `21 days — it's a habit now${n}.`,
      `Three weeks${n}? You're unreal.`,
      `${streak} days on a streak${n}. Pure fire.`,
      `You're on FIRE${n}!`,
    ], date);
  }

  if (streak <= 59) {
    return pick([
      `A full month${n}. Absolute beast.`,
      `${streak} days${n}. Nothing can stop you.`,
      `One month of showing up${n}. Legendary.`,
      `30+ days${n}? You're built different.`,
    ], date);
  }

  return pick([
    `${streak} days${n}. LEGEND STATUS.`,
    `You're elite${n}. Keep the streak alive.`,
    `${streak}-day streak${n}. Utterly unstoppable.`,
    `Hall of fame${n}. ${streak} days and going.`,
  ], date);
}

export default async function DashboardPage() {
  const goals = await getGoals();
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const sixtyDaysAgo = format(subDays(today, 60), "yyyy-MM-dd");
  const thirtyDaysAhead = format(addDays(today, 30), "yyyy-MM-dd");
  const [tasks, confirmationCount, profile, friendsProgress] = await Promise.all([
    getTasksForDateRange(sixtyDaysAgo, thirtyDaysAhead),
    getTodayConfirmationCount(),
    getCurrentProfile(),
    getFriendsWithTodayProgress(today),
  ]);

  const myConfirmations = await getMyConfirmationsForTasks(tasks.map((t) => t.id));

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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          {getStreakGreeting(longestStreak, profile?.display_name ?? null, today)}
        </h2>
        <p className="text-sm text-muted-foreground">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <OverviewStats
        totalGoals={goals.length}
        todayCompleted={todayCompleted}
        todayTotal={todayGoals.length}
        longestStreak={longestStreak}
        confirmations={confirmationCount}
        compact
      />

      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Create a goal to see your calendar.
        </p>
      ) : (
        <TaskCalendarPage
          goals={goals}
          tasks={tasks}
          confirmations={myConfirmations}
          rightColumnExtra={<FriendsTodaySection friends={friendsProgress} />}
        />
      )}
    </div>
  );
}
