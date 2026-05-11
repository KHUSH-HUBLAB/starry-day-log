import { Link } from "@tanstack/react-router";
import type { Child, AttendanceStatus } from "@/lib/daycare-store";
import { useDaycare } from "@/lib/daycare-store";
import { cn } from "@/lib/utils";

const colorMap = {
  peach: "bg-peach text-peach-foreground",
  sage: "bg-sage text-sage-foreground",
  sky: "bg-sky text-sky-foreground",
  butter: "bg-butter text-butter-foreground",
} as const;

const statusLabel: Record<AttendanceStatus, string> = {
  present: "Here today",
  absent: "Absent",
  late: "Running late",
};

const statusDot: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500",
  absent: "bg-rose-400",
  late: "bg-amber-400",
};

export function ChildCard({ child }: { child: Child }) {
  const { getAttendance } = useDaycare();
  const status = getAttendance(child.id);
  return (
    <Link
      to="/children/$childId"
      params={{ childId: child.id }}
      className="group block rounded-3xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-14 w-14 rounded-2xl grid place-items-center text-2xl shrink-0",
            colorMap[child.color],
          )}
        >
          {child.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-semibold truncate">{child.name}</div>
          <div className="text-xs text-muted-foreground">Age {child.age} · {child.parent}</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={cn("h-2 w-2 rounded-full", status ? statusDot[status] : "bg-muted-foreground/30")} />
            <span className="text-muted-foreground">{status ? statusLabel[status] : "Not marked"}</span>
          </div>
        </div>
      </div>
      {child.allergies && (
        <div className="mt-3 text-[11px] inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2 py-0.5">
          ⚠ Allergy: {child.allergies}
        </div>
      )}
    </Link>
  );
}
