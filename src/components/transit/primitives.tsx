import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { occupancyLevel, occupancyMeta, availableSeats } from "@/lib/transit/utils";
import type { Bus } from "@/lib/transit/types";

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function OccupancyBadge({ bus, showSeats = true }: { bus: Bus; showSeats?: boolean }) {
  const level = occupancyLevel(bus);
  const meta = occupancyMeta[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        meta.bg,
        meta.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {showSeats && level !== "full" ? `${availableSeats(bus)} seats free` : meta.label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-foreground",
    destructive: "bg-destructive-soft text-destructive",
  } as const;
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="num mt-1.5 text-2xl font-bold text-foreground">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        {icon ? (
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", tones[tone])}>
            {icon}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      {icon ? (
        <span className="mb-3 grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function RouteBadge({ code, className }: { code: string; className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("num rounded-md bg-primary-soft font-bold text-primary", className)}
    >
      {code}
    </Badge>
  );
}

export function StatusPill({
  status,
}: {
  status: "on-trip" | "idle" | "off-duty" | "delayed" | string;
}) {
  const map: Record<string, string> = {
    "on-trip": "bg-success-soft text-success",
    idle: "bg-muted text-muted-foreground",
    "off-duty": "bg-muted text-muted-foreground",
    delayed: "bg-warning-soft text-warning-foreground",
    open: "bg-destructive-soft text-destructive",
    "in-review": "bg-warning-soft text-warning-foreground",
    resolved: "bg-success-soft text-success",
    upcoming: "bg-primary-soft text-primary",
    completed: "bg-success-soft text-success",
    cancelled: "bg-muted text-muted-foreground",
    "no-show": "bg-destructive-soft text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        map[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status.replace("-", " ")}
    </span>
  );
}
