"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarView } from "./CalendarView";
import { DailyChecklist } from "./DailyChecklist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/database";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

export function TaskCalendarPage({
  goals,
  tasks,
}: {
  goals: Goal[];
  tasks: Task[];
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
          />
        </CardContent>
      </Card>
    </div>
  );
}
