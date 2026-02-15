"use client";

import { UserMinus, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { removeFriend } from "@/lib/actions/friends";
import { toast } from "sonner";
import type { FriendWithProfile } from "@/lib/queries/friends";

export function FriendCard({ friend }: { friend: FriendWithProfile }) {
  const initials = friend.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{friend.displayName}</span>
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
            onClick={async () => {
              const result = await removeFriend(friend.friendshipId);
              if (result.error) toast.error(result.error);
              else toast.success("Friend removed");
            }}
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
