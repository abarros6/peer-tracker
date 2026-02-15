"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">
          {format(currentMonth, "MMMM yyyy")}
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="py-1 text-xs font-medium text-muted-foreground">
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
                  "relative flex h-9 w-full items-center justify-center rounded-md text-sm transition-colors",
                  !inMonth && "text-muted-foreground/40",
                  inMonth && "hover:bg-accent",
                  selected && "bg-primary text-primary-foreground hover:bg-primary",
                  isToday(day) && !selected && "font-bold"
                )}
              >
                {format(day, "d")}
                {completion && inMonth && (
                  <span
                    className={cn(
                      "absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full",
                      allDone
                        ? "bg-green-500"
                        : someDone
                          ? "bg-yellow-500"
                          : "bg-muted-foreground/30"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
