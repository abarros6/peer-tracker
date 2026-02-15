import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/queries/auth";
import { getConfirmationsForTasks } from "@/lib/queries/confirmations";
import { FriendProgress } from "@/components/friends/FriendProgress";
import { Button } from "@/components/ui/button";

export default async function FriendDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: friendId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Get friend profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", friendId)
    .single();

  if (!profile) redirect("/friends");

  // Get friend's goals (RLS will check friendship)
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", friendId)
    .eq("archived", false);

  // Get friend's tasks for today
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", friendId)
    .eq("date", today);

  const taskIds = (tasks ?? []).map((t) => t.id);
  const confirmations = await getConfirmationsForTasks(taskIds);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/friends">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          {profile.display_name}
        </h2>
      </div>

      <FriendProgress
        friendName={profile.display_name}
        goals={goals ?? []}
        tasks={tasks ?? []}
        confirmations={confirmations}
        currentUserId={user.id}
        date={new Date()}
      />
    </div>
  );
}
