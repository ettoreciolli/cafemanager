import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  received: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  preparing: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ready: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  completed: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  cancelled: "bg-destructive/10 text-destructive",
  scheduled: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  in_transit: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}