"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createGoal, updateGoal } from "@/lib/actions/goals";
import { DAY_LABELS } from "@/lib/utils/days";
import { useState } from "react";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  recurrence: "daily" | "weekdays" | "weekends" | "custom";
  custom_days: number[] | null;
};

export function GoalForm({
  goal,
  onDone,
}: {
  goal?: Goal;
  onDone?: () => void;
}) {
  const [recurrence, setRecurrence] = useState(goal?.recurrence ?? "daily");
  const [customDays, setCustomDays] = useState<number[]>(goal?.custom_days ?? []);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      formData.set("recurrence", recurrence);
      if (recurrence === "custom") {
        formData.set("customDays", JSON.stringify(customDays));
      }
      const result = goal
        ? await updateGoal(goal.id, formData)
        : await createGoal(formData);
      if (result.success) onDone?.();
      return result;
    },
    null
  );

  function toggleDay(day: number) {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal ? "Edit Goal" : "New Goal"}</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={goal?.title}
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              defaultValue={goal?.description ?? ""}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label>Recurrence</Label>
            <div className="flex flex-wrap gap-2">
              {(["daily", "weekdays", "weekends", "custom"] as const).map(
                (r) => (
                  <Button
                    key={r}
                    type="button"
                    variant={recurrence === r ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRecurrence(r)}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Button>
                )
              )}
            </div>
          </div>
          {recurrence === "custom" && (
            <div className="space-y-2">
              <Label>Select days</Label>
              <div className="flex gap-2">
                {DAY_LABELS.map((label, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant={customDays.includes(i) ? "default" : "outline"}
                    size="sm"
                    className="w-10"
                    onClick={() => toggleDay(i)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : goal ? "Save Changes" : "Create Goal"}
          </Button>
          {onDone && (
            <Button type="button" variant="outline" onClick={onDone}>
              Cancel
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
