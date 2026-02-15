import Link from "next/link";
import { getCurrentUser } from "@/lib/queries/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AcceptInviteButton } from "@/components/friends/AcceptInviteButton";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Friend Invite</CardTitle>
          <CardDescription>
            Someone invited you to connect on Peer Tracker
          </CardDescription>
        </CardHeader>
        {user ? (
          <AcceptInviteButton code={code} />
        ) : (
          <>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                You need an account to accept this invite.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href={`/signup?next=/invite/${code}`}>
                  Create an account
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/login?next=/invite/${code}`}>
                  Sign in to existing account
                </Link>
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
