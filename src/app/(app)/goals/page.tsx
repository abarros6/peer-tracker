import { format, subDays, addDays } from "date-fns";
import { getGoals } from "@/lib/queries/goals";
import { getTasksForDateRange } from "@/lib/queries/tasks";
import { GoalList } from "@/components/goals/GoalList";
import { TaskCalendarPage } from "@/components/tasks/TaskCalendarPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function GoalsPage() {
  const goals = await getGoals();

  // Fetch tasks for a wide range so the calendar can show completion dots
  const today = new Date();
  const start = format(subDays(today, 60), "yyyy-MM-dd");
  const end = format(addDays(today, 30), "yyyy-MM-dd");
  const tasks = await getTasksForDateRange(start, end);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Goals</h2>
        <p className="text-muted-foreground">
          Track your daily goals on the calendar.
        </p>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="manage">Manage Goals</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-4">
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Create a goal first to see the calendar view.
            </p>
          ) : (
            <TaskCalendarPage goals={goals} tasks={tasks} />
          )}
        </TabsContent>
        <TabsContent value="manage" className="mt-4">
          <GoalList goals={goals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
