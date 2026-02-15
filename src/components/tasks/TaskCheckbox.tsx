"use client";

import { useOptimistic, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTask } from "@/lib/actions/tasks";
import { toast } from "sonner";

export function TaskCheckbox({
  goalId,
  date,
  initialCompleted,
}: {
  goalId: string;
  date: string;
  initialCompleted: boolean;
}) {
  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(initialCompleted);
  const [, startTransition] = useTransition();

  return (
    <Checkbox
      checked={optimisticCompleted}
      onCheckedChange={(checked) => {
        const newCompleted = checked === true;
        startTransition(async () => {
          setOptimisticCompleted(newCompleted);
          const result = await toggleTask(goalId, date, newCompleted);
          if (result.error) {
            toast.error("Failed to update task");
          }
        });
      }}
    />
  );
}
