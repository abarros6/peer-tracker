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
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
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
      <CalendarView
        goals={goals}
        tasks={tasks}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </div>
  );
}
