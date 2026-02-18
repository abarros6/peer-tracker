import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <WifiOff className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">You&apos;re offline</h1>
      <p className="max-w-xs text-muted-foreground">
        Check your connection and try again. Your progress is saved and will sync
        when you&apos;re back online.
      </p>
      <a
        href="/dashboard"
        className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </a>
    </div>
  );
}
