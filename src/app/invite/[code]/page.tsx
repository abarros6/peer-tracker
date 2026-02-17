import Link from "next/link";
import { Users, UserPlus, UserCheck, AlertCircle, Share2 } from "lucide-react";
import { getCurrentUser } from "@/lib/queries/auth";
import { getInviteByCode, areFriends } from "@/lib/queries/friends";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AcceptInviteButton } from "@/components/friends/AcceptInviteButton";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [user, inviteData] = await Promise.all([
    getCurrentUser(),
    getInviteByCode(code),
  ]);

  // State 1: Invalid invite (not found / expired / used)
  if (!inviteData) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center pb-2 pt-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-center px-6 pb-2">
            <h1 className="text-xl font-semibold tracking-tight">
              Invite Not Found
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This invite link is invalid, has expired, or has already been used.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 px-6 pb-8 pt-4">
            {user ? (
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild className="w-full">
                  <Link href="/signup">Create an account</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { invite, inviterName } = inviteData;

  // State 1b: Invite exists but is expired or already used
  const isExpired = new Date(invite.expires_at) < new Date();
  const isUsed = invite.accepted_by !== null;
  if (isExpired || isUsed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center pb-2 pt-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-center px-6 pb-2">
            <h1 className="text-xl font-semibold tracking-tight">
              Invite Not Found
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This invite link is invalid, has expired, or has already been used.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 px-6 pb-8 pt-4">
            {user ? (
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild className="w-full">
                  <Link href="/signup">Create an account</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  const initials = getInitials(inviterName);

  // State 2: Valid + unauthenticated
  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center pb-2 pt-8">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent className="space-y-3 text-center px-6 pb-2">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">
                {inviterName}
              </h1>
              <p className="text-sm text-muted-foreground">
                wants to connect with you on Peer Tracker
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/60 px-4 py-3">
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Track goals together and keep each other accountable
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 px-6 pb-8 pt-4">
            <Button asChild size="lg" className="w-full">
              <Link href={`/signup?next=/invite/${code}`}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create an account
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href={`/login?next=/invite/${code}`}>
                Sign in to existing account
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // State 3: Valid + authenticated + self-invite
  if (invite.inviter_id === user.id) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center pb-2 pt-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Share2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-center px-6 pb-2">
            <h1 className="text-xl font-semibold tracking-tight">
              This Is Your Invite
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share this link with a friend so they can connect with you on Peer
              Tracker.
            </p>
          </CardContent>
          <CardFooter className="px-6 pb-8 pt-4">
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/friends">Go to Friends</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // State 4: Valid + authenticated + already friends
  const alreadyFriends = await areFriends(user.id, invite.inviter_id);
  if (alreadyFriends) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center pb-2 pt-8">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent className="space-y-3 text-center px-6 pb-2">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">
                Already Friends
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You&apos;re already connected with{" "}
                <span className="font-medium text-foreground">
                  {inviterName}
                </span>
                .
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-500/10 px-4 py-3">
              <UserCheck className="h-4 w-4 shrink-0 text-green-600" />
              <p className="text-xs text-green-700 dark:text-green-400">
                You can view their progress on the friends page
              </p>
            </div>
          </CardContent>
          <CardFooter className="px-6 pb-8 pt-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/friends">Go to Friends</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // State 5: Valid + authenticated + can accept
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center pb-2 pt-8">
          <Avatar className="h-20 w-20 text-2xl">
            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent className="space-y-3 text-center px-6 pb-2">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {inviterName}
            </h1>
            <p className="text-sm text-muted-foreground">
              wants to connect with you on Peer Tracker
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/60 px-4 py-3">
            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Track goals together and keep each other accountable
            </p>
          </div>
        </CardContent>
        <AcceptInviteButton code={code} inviterName={inviterName} />
      </Card>
    </div>
  );
}
