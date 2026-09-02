import { Link } from "@tanstack/react-router";
import { Clock, Gauge, MapPin, Snowflake, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OccupancyBadge, RouteBadge, StatusPill } from "./primitives";
import { nextStopInfo, occupancyPct, trustLevel } from "@/lib/transit/utils";
import { routeById } from "@/lib/transit/mock-data";
import type { Bus } from "@/lib/transit/types";
import { cn } from "@/lib/utils";

export function BusCard({
  bus,
  selected,
  onSelect,
}: {
  bus: Bus;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const route = routeById(bus.routeId);
  const next = nextStopInfo(bus);
  const trust = trustLevel(bus.trustScore);

  return (
    <Card
      onClick={() => onSelect?.(bus.id)}
      className={cn(
        "cursor-pointer border-border transition-all hover:shadow-card",
        selected && "border-primary ring-2 ring-primary/25",
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="num truncate text-sm font-bold text-foreground">{bus.number}</p>
              {route ? <RouteBadge code={route.code} /> : null}
              {bus.ac ? <Snowflake className="size-3.5 text-primary" /> : null}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{route?.name}</p>
          </div>
          <StatusPill status={bus.status} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OccupancyBadge bus={bus} />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Gauge className="size-3.5" /> <span className="num">{bus.speedKmh}</span> km/h
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> {trust.label}
          </span>
        </div>

        <Progress value={occupancyPct(bus)} className="h-1.5" />

        {next ? (
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">Next: {next.stop.name}</span>
            </span>
            <span className="num flex items-center gap-1 text-xs font-semibold text-primary">
              <Clock className="size-3.5" /> {next.etaMin} min
            </span>
          </div>
        ) : null}

        <div className="flex gap-2 pt-0.5">
          <Link
            to="/bus/$busId"
            params={{ busId: bus.id }}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-center text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            onClick={(e) => e.stopPropagation()}
          >
            Details
          </Link>
          <Link
            to="/book"
            search={{ busId: bus.id }}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={(e) => e.stopPropagation()}
          >
            Book seat
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
