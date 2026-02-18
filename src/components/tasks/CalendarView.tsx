"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { isGoalActiveOnDate } from "@/lib/utils/days";
import type { Database } from "@/types/database";

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];

export function CalendarView({
  goals,
  tasks,
  onSelectDate,
  selectedDate,
}: {
  goals: Goal[];
  tasks: Task[];
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function getCompletionForDate(date: Date) {
    const dateStr = format(date, "yyyy-MM-dd");
    const activeGoals = goals.filter((g) =>
      isGoalActiveOnDate(date, g.recurrence, g.custom_days)
    );
    if (activeGoals.length === 0) return null;
    const completed = activeGoals.filter((g) =>
      tasks.some((t) => t.goal_id === g.id && t.date === dateStr && t.completed)
    ).length;
    return { completed, total: activeGoals.length };
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <h2 className="text-xl font-bold tracking-wide">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
            <div key={d} className="py-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const completion = getCompletionForDate(day);
            const inMonth = isSameMonth(day, currentMonth);
            const selected = isSameDay(day, selectedDate);
            const allDone =
              completion && completion.completed === completion.total;
            const someDone = completion && completion.completed > 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={cn(
                  "relative flex aspect-square w-full flex-col items-center justify-center rounded-xl text-sm transition-all",
                  !inMonth && "opacity-25",
                  inMonth && !selected && allDone && "bg-emerald-100 dark:bg-emerald-900/30",
                  inMonth && !selected && someDone && !allDone && "bg-amber-100 dark:bg-amber-900/25",
                  inMonth && !selected && "hover:ring-2 hover:ring-primary/40",
                  selected && "bg-primary text-primary-foreground shadow-sm",
                  isToday(day) && !selected && "ring-2 ring-primary font-bold"
                )}
              >
                <span className="text-sm">{format(day, "d")}</span>
                {completion && inMonth && !selected && (
                  <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">
                    {completion.completed}/{completion.total}
                  </span>
                )}
                {completion && inMonth && selected && (
                  <span className="mt-0.5 text-[10px] leading-none text-primary-foreground/70">
                    {completion.completed}/{completion.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
