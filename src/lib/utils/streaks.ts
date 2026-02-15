import { format, subDays, isAfter } from "date-fns";
import { isGoalActiveOnDate } from "./days";

type Goal = {
  id: string;
  recurrence: "daily" | "weekdays" | "weekends" | "custom";
  custom_days: number[] | null;
  created_at: string;
};

type Task = {
  goal_id: string;
  date: string;
  completed: boolean;
};

export function calculateStreak(goal: Goal, tasks: Task[]): number {
  const completedDates = new Set(
    tasks
      .filter((t) => t.goal_id === goal.id && t.completed)
      .map((t) => t.date)
  );

  let streak = 0;
  let date = new Date();
  const createdDate = new Date(goal.created_at);

  // Check today first — if not active today, start from yesterday
  if (!isGoalActiveOnDate(date, goal.recurrence, goal.custom_days)) {
    date = subDays(date, 1);
  }

  while (isAfter(date, subDays(createdDate, 1))) {
    if (!isGoalActiveOnDate(date, goal.recurrence, goal.custom_days)) {
      date = subDays(date, 1);
      continue;
    }

    const dateStr = format(date, "yyyy-MM-dd");
    if (completedDates.has(dateStr)) {
      streak++;
      date = subDays(date, 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateCompletionRate(
  goal: Goal,
  tasks: Task[],
  days: number = 30
): number {
  const today = new Date();
  let activeDays = 0;
  let completedDays = 0;

  const completedDates = new Set(
    tasks
      .filter((t) => t.goal_id === goal.id && t.completed)
      .map((t) => t.date)
  );

  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    if (isGoalActiveOnDate(date, goal.recurrence, goal.custom_days)) {
      activeDays++;
      if (completedDates.has(format(date, "yyyy-MM-dd"))) {
        completedDays++;
      }
    }
  }

  return activeDays === 0 ? 0 : Math.round((completedDays / activeDays) * 100);
}
