"use client";

import { useOptimistic, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmTask, removeConfirmation } from "@/lib/actions/confirmations";
import { toast } from "sonner";

export function ConfirmButton({
  taskId,
  initialConfirmed,
}: {
  taskId: string;
  initialConfirmed: boolean;
}) {
  const [optimisticConfirmed, setOptimisticConfirmed] = useOptimistic(initialConfirmed);
  const [, startTransition] = useTransition();

  return (
    <Button
      variant={optimisticConfirmed ? "default" : "outline"}
      size="sm"
      onClick={() => {
        startTransition(async () => {
          setOptimisticConfirmed(!optimisticConfirmed);
          const result = optimisticConfirmed
            ? await removeConfirmation(taskId)
            : await confirmTask(taskId);
          if (result.error) {
            toast.error(result.error);
          }
        });
      }}
    >
      <ThumbsUp className="mr-1 h-3 w-3" />
      {optimisticConfirmed ? "Confirmed" : "Confirm"}
    </Button>
  );
}
