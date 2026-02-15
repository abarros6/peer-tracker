import { Target, CheckCircle, Flame, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OverviewStats({
  totalGoals,
  todayCompleted,
  todayTotal,
  longestStreak,
}: {
  totalGoals: number;
  todayCompleted: number;
  todayTotal: number;
  longestStreak: number;
}) {
  const stats = [
    {
      label: "Active Goals",
      value: totalGoals,
      icon: Target,
    },
    {
      label: "Today",
      value: `${todayCompleted}/${todayTotal}`,
      icon: CheckCircle,
    },
    {
      label: "Best Streak",
      value: `${longestStreak}d`,
      icon: Flame,
    },
    {
      label: "Today Rate",
      value: todayTotal > 0 ? `${Math.round((todayCompleted / todayTotal) * 100)}%` : "—",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
