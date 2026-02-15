import { createClient } from "@/lib/supabase/server";

export async function getConfirmationsForTasks(taskIds: string[]) {
  if (taskIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("confirmations")
    .select("*, profiles:confirmed_by(display_name)")
    .in("task_id", taskIds);

  return data ?? [];
}
