"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function confirmTask(taskId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("confirmations").insert({
    task_id: taskId,
    confirmed_by: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Already confirmed" };
    }
    return { error: error.message };
  }

  revalidatePath("/friends");
  return { success: true };
}

export async function removeConfirmation(taskId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("confirmations")
    .delete()
    .eq("task_id", taskId)
    .eq("confirmed_by", user.id);

  if (error) return { error: error.message };

  revalidatePath("/friends");
  return { success: true };
}
