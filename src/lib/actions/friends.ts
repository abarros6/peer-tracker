"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { addDays } from "date-fns";

export async function createInvite() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const code = nanoid(8);
  const expiresAt = addDays(new Date(), 7).toISOString();

  const { error } = await supabase.from("invites").insert({
    code,
    inviter_id: user.id,
    expires_at: expiresAt,
  });

  if (error) return { error: error.message };

  return { code };
}

export async function acceptInvite(code: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Find the invite
  const { data: invite, error: findError } = await supabase
    .from("invites")
    .select("*")
    .eq("code", code)
    .is("accepted_by", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (findError || !invite) {
    return { error: "Invalid or expired invite" };
  }

  if (invite.inviter_id === user.id) {
    return { error: "You cannot accept your own invite" };
  }

  // Create friendship with canonical ordering
  const [userA, userB] =
    invite.inviter_id < user.id
      ? [invite.inviter_id, user.id]
      : [user.id, invite.inviter_id];

  // Check if already friends
  const { data: existing } = await supabase
    .from("friendships")
    .select("id")
    .eq("user_a", userA)
    .eq("user_b", userB)
    .single();

  if (existing) {
    return { error: "You are already friends" };
  }

  // Mark invite as accepted
  const { error: updateError } = await supabase
    .from("invites")
    .update({ accepted_by: user.id })
    .eq("id", invite.id);

  if (updateError) return { error: updateError.message };

  // Create friendship
  const { error: friendError } = await supabase
    .from("friendships")
    .insert({ user_a: userA, user_b: userB });

  if (friendError) return { error: friendError.message };

  revalidatePath("/friends");
  return { success: true };
}

export async function removeFriend(friendshipId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) return { error: error.message };

  revalidatePath("/friends");
  return { success: true };
}
