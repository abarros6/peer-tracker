"use client";

import { useState } from "react";
import { Archive, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { archiveGoal, restoreGoal, deleteGoal } from "@/lib/actions/goals";
import { toast } from "sonner";
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
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const activeDays = getDaysForRecurrence(goal.recurrence, goal.custom_days);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-base">{goal.title}</CardTitle>
            {goal.description && (
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            )}
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-1">
            {!archived && onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {archived ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={async () => {
                    const result = await restoreGoal(goal.id);
                    if (result?.error) toast.error(result.error);
                    else toast.success("Goal restored");
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => setShowArchiveConfirm(true)}
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs capitalize">
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

      <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive &ldquo;{goal.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This goal will be hidden from your dashboard and calendar. Your
              task history is preserved and you can restore it any time from
              the bottom of the Goals page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const result = await archiveGoal(goal.id);
                if (result?.error) toast.error(result.error);
                else toast.success("Goal archived");
              }}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete &ldquo;{goal.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The goal and all of its task history will
              be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                const result = await deleteGoal(goal.id);
                if (result?.error) toast.error(result.error);
                else toast.success("Goal deleted");
              }}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
