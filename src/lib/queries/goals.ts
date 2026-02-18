import { createClient } from "@/lib/supabase/server";

export async function getArchivedGoals() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("archived", true)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getGoals() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  return data ?? [];
}

