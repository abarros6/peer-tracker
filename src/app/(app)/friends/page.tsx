import { getFriendsWithTodayProgress } from "@/lib/queries/friends";
import { FriendCard } from "@/components/friends/FriendCard";
import { InviteGenerator } from "@/components/friends/InviteGenerator";

export default async function FriendsPage() {
  const friends = await getFriendsWithTodayProgress(new Date());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Friends</h2>
        <p className="text-muted-foreground">
          Invite friends and track each other&apos;s progress.
        </p>
      </div>

      <InviteGenerator />

      {friends.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No friends yet. Share an invite link to get started.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {friends.map((friend) => (
            <FriendCard
              key={friend.friendshipId}
              friend={friend}
              progress={{ completed: friend.completedToday, total: friend.totalToday }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
