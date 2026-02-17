import { createClient } from "@/lib/supabase/server";

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
