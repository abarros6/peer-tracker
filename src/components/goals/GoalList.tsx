"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalCard } from "./GoalCard";
import { GoalForm } from "./GoalForm";
import type { Database } from "@/types/database";

type Goal = Database["public"]["Tables"]["goals"]["Row"];

export function GoalList({ goals }: { goals: Goal[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  if (editingGoal) {
    return (
      <GoalForm
        goal={editingGoal}
        onDone={() => setEditingGoal(null)}
      />
    );
  }

  return (
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
          No goals yet. Create your first goal to get started.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={() => setEditingGoal(goal)}
          />
        ))}
      </div>
    </div>
  );
}
