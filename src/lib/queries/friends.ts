import { createClient } from "@/lib/supabase/server";

export type FriendWithProfile = {
  friendshipId: string;
  friendId: string;
  displayName: string;
  avatarUrl: string | null;
};

export async function getInviteByCode(code: string) {
  const supabase = await createClient();

  const { data: invite } = await supabase
    .from("invites")
    .select("id, code, inviter_id, accepted_by, expires_at")
    .eq("code", code)
    .single();

  if (!invite) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", invite.inviter_id)
    .single();

  return {
    invite,
    inviterName: profile?.display_name ?? "Someone",
  };
}

export async function areFriends(
  userId1: string,
  userId2: string
): Promise<boolean> {
  const supabase = await createClient();

  const [userA, userB] =
    userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  const { data } = await supabase
    .from("friendships")
    .select("id")
    .eq("user_a", userA)
    .eq("user_b", userB)
    .single();

  return !!data;
}

export async function getFriends(): Promise<FriendWithProfile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: friendships } = await supabase
    .from("friendships")
    .select("*")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  if (!friendships || friendships.length === 0) return [];

  const friendIds = friendships.map((f) =>
    f.user_a === user.id ? f.user_b : f.user_a
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", friendIds);

  if (!profiles) return [];

  return friendships.map((f) => {
    const friendId = f.user_a === user.id ? f.user_b : f.user_a;
    const profile = profiles.find((p) => p.id === friendId);
    return {
      friendshipId: f.id,
      friendId,
      displayName: profile?.display_name ?? "Unknown",
      avatarUrl: profile?.avatar_url ?? null,
    };
  });
}
