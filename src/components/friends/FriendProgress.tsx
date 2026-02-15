import { format } from "date-fns";
import { CheckCircle, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "./ConfirmButton";
import type { Database } from "@/types/database";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

type Confirmation = {
  task_id: string;
  confirmed_by: string;
};

export function FriendProgress({
  friendName,
  goals,
  tasks,
  confirmations,
  currentUserId,
  date,
}: {
  friendName: string;
  goals: Goal[];
  tasks: Task[];
  confirmations: Confirmation[];
  currentUserId: string;
  date: Date;
}) {
  const dateStr = format(date, "yyyy-MM-dd");
  const todayTasks = tasks.filter((t) => t.date === dateStr);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {friendName}&apos;s Progress — {format(date, "MMM d")}
      </h3>

      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {friendName} hasn&apos;t created any goals yet.
        </p>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => {
            const task = todayTasks.find((t) => t.goal_id === goal.id);
            const isConfirmedByMe =
              task &&
              confirmations.some(
                (c) =>
                  c.task_id === task.id && c.confirmed_by === currentUserId
              );

            return (
              <Card key={goal.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {task?.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <span className="font-medium">{goal.title}</span>
                      <Badge
                        variant={task?.completed ? "default" : "secondary"}
                        className="ml-2 text-xs"
                      >
                        {task?.completed ? "Done" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  {task?.completed && (
                    <ConfirmButton
                      taskId={task.id}
                      initialConfirmed={isConfirmedByMe ?? false}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
