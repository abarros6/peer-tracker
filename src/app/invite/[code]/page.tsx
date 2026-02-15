"use client";

import { useActionState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { acceptInvite } from "@/lib/actions/friends";

export default function InvitePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, _formData: FormData) => {
      const result = await acceptInvite(params.code);
      if (result.success) {
        router.push("/friends");
      }
      return result;
    },
    null
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Friend Invite</CardTitle>
          <CardDescription>
            Someone invited you to connect on Peer Tracker
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600">
              You are now friends. Redirecting...
            </p>
          )}
        </CardContent>
        <CardFooter>
          <form action={formAction} className="w-full">
            <Button type="submit" className="w-full" disabled={pending || state?.success}>
              {pending ? "Accepting..." : "Accept Invite"}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
