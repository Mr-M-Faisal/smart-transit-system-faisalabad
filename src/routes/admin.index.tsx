import { createFileRoute } from "@tanstack/react-router";
import { BusFront, CreditCard, Satellite, TicketCheck, TriangleAlert, Users } from "lucide-react";
import { StatCard, OccupancyBadge, StatusPill, RouteBadge } from "@/components/transit/primitives";
import { TransitMap } from "@/components/map/TransitMap";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store/app-store";
import { formatPKR, relativeTime } from "@/lib/transit/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { buses, routes, stops, bookings, reports } = useStore();

  const active = buses.filter((b) => b.status !== "off-duty");
  const delayed = buses.filter((b) => b.status === "delayed");
  const capacity = buses.reduce((sum, b) => sum + b.capacity, 0);
  const occupied = buses.reduce((sum, b) => sum + b.occupied, 0);
  const revenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.fare, 0);
  const openReports = reports.filter((r) => r.status !== "resolved").length;
  const avgAccuracy = Math.round(
    buses.reduce((s, b) => s + b.gpsAccuracyM, 0) / Math.max(buses.length, 1),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Buses live"
          value={`${active.length}/${buses.length}`}
          hint={`${delayed.length} running late`}
          icon={BusFront}
        />
        <StatCard
          label="Network occupancy"
          value={`${Math.round((occupied / Math.max(capacity, 1)) * 100)}%`}
          hint={`${occupied} of ${capacity} seats filled`}
          icon={Users}
          tone="success"
        />
        <StatCard
          label="Revenue (bookings)"
          value={formatPKR(revenue)}
          hint={`${bookings.length} bookings recorded`}
          icon={CreditCard}
        />
        <StatCard
          label="Routes & stops"
          value={`${routes.length} / ${stops.length}`}
          hint="Active corridors and stops"
          icon={TicketCheck}
        />
        <StatCard
          label="Open condition reports"
          value={`${openReports}`}
          hint="Awaiting maintenance action"
          icon={TriangleAlert}
          tone="warning"
        />
        <StatCard
          label="Avg GPS accuracy"
          value={`±${avgAccuracy} m`}
          hint="Across the broadcasting fleet"
          icon={Satellite}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="h-[380px] w-full">
          <TransitMap buses={buses} routes={routes} stops={stops} showStops={false} />
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="border-b border-border p-5">
            <h2 className="text-sm font-semibold text-foreground">Live fleet</h2>
            <p className="text-xs text-muted-foreground">
              Positions, speed and occupancy refresh automatically.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead className="text-right">Speed</TableHead>
                  <TableHead className="text-right">Punctuality</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => {
                  const route = routes.find((r) => r.id === bus.routeId);
                  return (
                    <TableRow key={bus.id}>
                      <TableCell className="num font-semibold">{bus.number}</TableCell>
                      <TableCell>{route ? <RouteBadge code={route.code} /> : "—"}</TableCell>
                      <TableCell>
                        <StatusPill status={bus.status} />
                      </TableCell>
                      <TableCell>
                        <OccupancyBadge bus={bus} />
                      </TableCell>
                      <TableCell className="num text-right">{bus.speedKmh} km/h</TableCell>
                      <TableCell className="num text-right">{bus.punctualityPct}%</TableCell>
                      <TableCell className="num text-right text-xs text-muted-foreground">
                        {relativeTime(bus.lastUpdated)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
