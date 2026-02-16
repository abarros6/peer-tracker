import { getGoals } from "@/lib/queries/goals";
import { GoalList } from "@/components/goals/GoalList";

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Goals</h2>
        <p className="text-muted-foreground">
          Create and manage your daily goals.
        </p>
      </div>

      <GoalList goals={goals} />
    </div>
  );
}
