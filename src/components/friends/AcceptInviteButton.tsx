"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { acceptInvite } from "@/lib/actions/friends";

export function AcceptInviteButton({ code }: { code: string }) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, _formData: FormData) => {
      const result = await acceptInvite(code);
      if (result.success) {
        router.push("/friends");
      }
      return result;
    },
    null
  );

  return (
    <>
      <CardContent>
        {state?.error && (
          <p className="text-center text-sm text-destructive">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-center text-sm text-green-600">
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
    </>
  );
}
