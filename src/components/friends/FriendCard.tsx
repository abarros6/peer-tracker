"use client";

import { useState } from "react";
import { UserMinus, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removeFriend } from "@/lib/actions/friends";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FriendWithProfile } from "@/lib/queries/friends";

export function FriendCard({
  friend,
  progress,
}: {
  friend: FriendWithProfile;
  progress?: { completed: number; total: number };
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const initials = friend.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{friend.displayName}</span>
            {progress && progress.total > 0 && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  progress.completed === progress.total
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : progress.completed > 0
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                )}
              >
                {progress.completed}/{progress.total}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/friends/${friend.friendId}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirm(true)}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove friend?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {friend.displayName}? You won&apos;t
              be able to see each other&apos;s progress anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const result = await removeFriend(friend.friendshipId);
                if (result.error) toast.error(result.error);
                else toast.success("Friend removed");
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
