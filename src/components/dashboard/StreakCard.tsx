import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StreakCard({
  title,
  streak,
  completionRate,
}: {
  title: string;
  streak: number;
  completionRate: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Flame
          className={`h-4 w-4 ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {streak} day{streak !== 1 ? "s" : ""}
        </div>
        <p className="text-xs text-muted-foreground">
          {completionRate}% completion (30d)
        </p>
      </CardContent>
    </Card>
  );
}
