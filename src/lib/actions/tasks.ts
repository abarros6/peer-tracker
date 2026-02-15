"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleTask(goalId: string, date: string, completed: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (completed) {
    // Upsert: create or update task row
    const { error } = await supabase.from("tasks").upsert(
      {
        goal_id: goalId,
        user_id: user.id,
        date,
        completed: true,
      },
      { onConflict: "goal_id,date" }
    );
    if (error) return { error: error.message };
  } else {
    // Set completed to false (keep the row)
    const { error } = await supabase
      .from("tasks")
      .update({ completed: false })
      .eq("goal_id", goalId)
      .eq("date", date);
    if (error) return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/goals");
  return { success: true };
}
