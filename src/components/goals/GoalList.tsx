"use client";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GoalCard } from "./GoalCard";
import { GoalForm } from "./GoalForm";
import type { Database } from "@/types/database";

type Goal = Database["public"]["Tables"]["goals"]["Row"];

export function GoalList({
  goals,
  archivedGoals,
}: {
  goals: Goal[];
  archivedGoals: Goal[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  if (editingGoal) {
    return (
      <GoalForm
        goal={editingGoal}
        onDone={() => setEditingGoal(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {showForm ? (
          <GoalForm onDone={() => setShowForm(false)} />
        ) : (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        )}
        {goals.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground">
            No active goals. Create your first goal to get started.
          </p>
        )}
        {goals.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => setEditingGoal(goal)}
              />
            ))}
          </div>
        )}
      </div>

      {archivedGoals.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                showArchived && "rotate-180"
              )}
            />
            Archived goals ({archivedGoals.length})
          </button>
          {showArchived && (
            <div className="grid gap-4 opacity-60 sm:grid-cols-2">
              {archivedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} archived />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
