import { Target, CheckCircle, Flame, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function OverviewStats({
  totalGoals,
  todayCompleted,
  todayTotal,
  longestStreak,
  confirmations = 0,
  compact = false,
}: {
  totalGoals: number;
  todayCompleted: number;
  todayTotal: number;
  longestStreak: number;
  confirmations?: number;
  compact?: boolean;
}) {
  const stats = [
    {
      label: "Goals",
      value: totalGoals,
      icon: Target,
    },
    {
      label: "Today",
      value: todayTotal === 0 ? "—" : `${todayCompleted}/${todayTotal}`,
      icon: CheckCircle,
    },
    {
      label: "Best Streak",
      value: longestStreak,
      icon: Flame,
    },
    {
      label: "Kudos",
      value: confirmations,
      icon: Users,
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-4 overflow-x-auto rounded-xl bg-card px-4 py-2.5 border sm:gap-6 sm:px-5 sm:py-3">
        {stats.map((stat) => {
          const isStreak = stat.label === "Best Streak";
          const streakHighlight = isStreak && longestStreak >= 7;
          return (
            <div key={stat.label} className="flex items-center gap-2 shrink-0">
              <stat.icon
                className={cn(
                  "h-4 w-4",
                  streakHighlight ? "text-amber-500" : "text-primary"
                )}
              />
              <span className={cn("font-bold", streakHighlight ? "text-xl" : "text-lg")}>
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">
                {streakHighlight ? `${longestStreak}-day streak!` : stat.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const isStreak = stat.label === "Best Streak";
        const streakHighlight = isStreak && longestStreak >= 7;
        return (
          <Card key={stat.label} className={cn(streakHighlight && "bg-amber-50/40 dark:bg-amber-900/10")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {streakHighlight ? `${longestStreak}-day streak!` : stat.label}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", streakHighlight ? "text-amber-500" : "text-muted-foreground")} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
