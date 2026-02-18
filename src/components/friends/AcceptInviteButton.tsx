"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { acceptInvite } from "@/lib/actions/friends";

export function AcceptInviteButton({
  code,
  inviterName,
}: {
  code: string;
  inviterName: string;
}) {
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
    <CardFooter className="flex flex-col gap-3 px-6 pb-8 pt-4">
      {state?.error && (
        <div className="w-full rounded-lg bg-destructive/10 px-4 py-3">
          <p className="text-center text-sm text-destructive">{state.error}</p>
        </div>
      )}
      {state?.success && (
        <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            You&apos;re now friends with {inviterName}!
          </p>
        </div>
      )}
      <form action={formAction} className="w-full">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending || state?.success}
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Accepting...
            </>
          ) : state?.success ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Accepted
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Accept Invite
            </>
          )}
        </Button>
      </form>
    </CardFooter>
  );
}
