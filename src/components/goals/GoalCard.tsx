"use client";

import { Archive, Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { archiveGoal, restoreGoal } from "@/lib/actions/goals";
import { DAY_LABELS, getDaysForRecurrence } from "@/lib/utils/days";
import type { Database } from "@/types/database";

type Goal = Database["public"]["Tables"]["goals"]["Row"];

export function GoalCard({
  goal,
  onEdit,
  archived = false,
}: {
  goal: Goal;
  onEdit?: () => void;
  archived?: boolean;
}) {
  const activeDays = getDaysForRecurrence(goal.recurrence, goal.custom_days);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">{goal.title}</CardTitle>
          {goal.description && (
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          )}
        </div>
        <div className="flex gap-1">
          {!archived && onEdit && (
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {archived ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await restoreGoal(goal.id);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await archiveGoal(goal.id);
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {goal.recurrence}
          </Badge>
          {goal.recurrence === "custom" &&
            activeDays.map((d) => (
              <Badge key={d} variant="outline" className="text-xs">
                {DAY_LABELS[d]}
              </Badge>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
