"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  recurrence: z.enum(["daily", "weekdays", "weekends", "custom"]),
  customDays: z.array(z.number().min(0).max(6)).optional(),
});

export async function createGoal(formData: FormData) {
  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    recurrence: formData.get("recurrence") || "daily",
    customDays: formData.get("customDays")
      ? JSON.parse(formData.get("customDays") as string)
      : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    recurrence: parsed.data.recurrence,
    custom_days: parsed.data.customDays ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateGoal(goalId: string, formData: FormData) {
  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    recurrence: formData.get("recurrence") || "daily",
    customDays: formData.get("customDays")
      ? JSON.parse(formData.get("customDays") as string)
      : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      recurrence: parsed.data.recurrence,
      custom_days: parsed.data.customDays ?? null,
    })
    .eq("id", goalId);

  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function archiveGoal(goalId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({ archived: true })
    .eq("id", goalId);

  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function restoreGoal(goalId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .update({ archived: false })
    .eq("id", goalId);

  if (error) return { error: error.message };

  revalidatePath("/goals");
  return { success: true };
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId);

  if (error) return { error: error.message };

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: true };
}
