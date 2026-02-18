"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarView } from "./CalendarView";
import { DailyChecklist } from "./DailyChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/database";
import type { TaskConfirmation } from "@/lib/queries/confirmations";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

export function TaskCalendarPage({
  goals,
  tasks,
  confirmations = [],
  rightColumnExtra,
}: {
  goals: Goal[];
  tasks: Task[];
  confirmations?: TaskConfirmation[];
  rightColumnExtra?: React.ReactNode;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <CalendarView
        goals={goals}
        tasks={tasks}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <div className="flex flex-col gap-6">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {format(selectedDate, "EEEE, MMMM d")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DailyChecklist
              date={selectedDate}
              goals={goals}
              tasks={tasks}
              confirmations={confirmations}
            />
          </CardContent>
        </Card>
        {rightColumnExtra}
      </div>
    </div>
  );
}
