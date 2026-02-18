import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { FriendTodayProgress } from "@/lib/queries/friends";

function pillClass(completed: number, total: number) {
  if (total === 0) return "bg-muted text-muted-foreground";
  if (completed === total) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (completed > 0) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
}

export function FriendsTodaySection({
  friends,
}: {
  friends: FriendTodayProgress[];
}) {
  if (friends.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Friends Today
      </h3>
      <div className="flex flex-wrap gap-2">
        {friends.map((friend) => {
          const initials = friend.displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <Link
              key={friend.friendshipId}
              href={`/friends/${friend.friendId}`}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80 ${pillClass(friend.completedToday, friend.totalToday)}`}
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <span>{friend.displayName}</span>
              {friend.totalToday > 0 && (
                <span className="font-bold">
                  {friend.completedToday}/{friend.totalToday}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
