import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export type TaskConfirmation = {
  task_id: string;
  confirmed_by: string;
  confirmerName: string;
};

export async function getTodayConfirmationCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const today = format(new Date(), "yyyy-MM-dd");

  // Count confirmations on the current user's tasks from today
  const { count } = await supabase
    .from("confirmations")
    .select("*, tasks!inner(user_id, date)", { count: "exact", head: true })
    .eq("tasks.user_id", user.id)
    .eq("tasks.date", today)
    .neq("confirmed_by", user.id);

  return count ?? 0;
}

export async function getMyConfirmationsForTasks(
  taskIds: string[]
): Promise<TaskConfirmation[]> {
  if (taskIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("confirmations")
    .select("task_id, confirmed_by, profiles:confirmed_by(display_name)")
    .in("task_id", taskIds);

  return (data ?? []).map((c) => ({
    task_id: c.task_id,
    confirmed_by: c.confirmed_by,
    confirmerName:
      (c.profiles as { display_name: string } | null)?.display_name ??
      "Someone",
  }));
}

export async function getConfirmationsForTasks(taskIds: string[]) {
  if (taskIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("confirmations")
    .select("*, profiles:confirmed_by(display_name)")
    .in("task_id", taskIds);

  return data ?? [];
}
