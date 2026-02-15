import { createClient } from "@/lib/supabase/server";
import { format, startOfMonth, endOfMonth } from "date-fns";

export async function getTasksForMonth(date: Date) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const start = format(startOfMonth(date), "yyyy-MM-dd");
  const end = format(endOfMonth(date), "yyyy-MM-dd");

  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", start)
    .lte("date", end);

  return data ?? [];
}

export async function getTasksForDateRange(
  startDate: string,
  endDate: string,
  userId?: string
) {
  const supabase = await createClient();

  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    userId = user.id;
  }

  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate);

  return data ?? [];
}
