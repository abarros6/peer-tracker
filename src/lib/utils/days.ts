import { getDay } from "date-fns";

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getDaysForRecurrence(
  recurrence: "daily" | "weekdays" | "weekends" | "custom",
  customDays?: number[] | null
): number[] {
  switch (recurrence) {
    case "daily":
      return [0, 1, 2, 3, 4, 5, 6];
    case "weekdays":
      return [1, 2, 3, 4, 5];
    case "weekends":
      return [0, 6];
    case "custom":
      return customDays ?? [];
  }
}

export function isGoalActiveOnDate(
  date: Date,
  recurrence: "daily" | "weekdays" | "weekends" | "custom",
  customDays?: number[] | null
): boolean {
  const dayOfWeek = getDay(date);
  const activeDays = getDaysForRecurrence(recurrence, customDays);
  return activeDays.includes(dayOfWeek);
}
