import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Play, Radio, Square, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, OccupancyBadge, StatusPill } from "@/components/transit/primitives";
import { TransitMap } from "@/components/map/TransitMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store/app-store";
import { availableSeats, nextStopInfo, upcomingStops } from "@/lib/transit/utils";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [
      { title: "Driver Console — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "Start a shift, broadcast live GPS location and update onboard seat occupancy from the driver console.",
      },
      { property: "og:title", content: "Driver Console — Smart Transit" },
      {
        property: "og:description",
        content: "Shift control, GPS broadcasting and occupancy updates for bus drivers.",
      },
    ],
  }),
  component: DriverPage,
});

function DriverPage() {
  const {
    buses,
    routes,
    stops,
    drivers,
    driverBusId,
    setDriverBusId,
    shiftActive,
    setShiftActive,
    setOccupancy,
    pushNotification,
  } = useStore();

  const bus = buses.find((b) => b.id === driverBusId) ?? buses[0];
  const route = routes.find((r) => r.id === bus?.routeId);
  const driver = drivers.find((d) => d.id === bus?.driverId);
  const next = bus ? nextStopInfo(bus) : null;
  const coming = bus ? upcomingStops(bus, 4) : [];
  const routeStops = route
    ? route.stopIds
        .map((id) => stops.find((s) => s.id === id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s))
    : [];

  if (!bus) return null;

  const toggleShift = () => {
    const next = !shiftActive;
    setShiftActive(next);
    pushNotification({
      kind: "service",
      title: next ? "Shift started" : "Shift ended",
      body: `${bus.number} ${next ? "is now broadcasting live GPS" : "stopped broadcasting"}.`,
    });
    toast.success(next ? "Shift started — GPS broadcasting" : "Shift ended");
  };

  return (
    <div className="section py-8">
      <PageHeader
        eyebrow="Driver console"
        title={`Bus ${bus.number}`}
        subtitle={
          driver
            ? `${driver.name} · ${driver.shift} shift · licence ${driver.licenseNo}`
            : "Unassigned driver"
        }
        actions={
          <Button variant={shiftActive ? "outline" : "default"} onClick={toggleShift}>
            {shiftActive ? (
              <>
                <Square className="size-4" /> End shift
              </>
            ) : (
              <>
                <Play className="size-4" /> Start shift
              </>
            )}
          </Button>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Card className="border-border">
            <CardContent className="space-y-3 p-5">
              <Label>Assigned bus</Label>
              <Select value={bus.id} onValueChange={setDriverBusId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.number} · {b.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between pt-1">
                <StatusPill status={bus.status} />
                <span
                  className={
                    shiftActive
                      ? "inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success"
                      : "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                  }
                >
                  <Radio className="size-3.5" />
                  {shiftActive ? "GPS broadcasting" : "GPS off"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Users className="size-4 text-primary" /> Onboard passengers
                </span>
                <OccupancyBadge bus={bus} showSeats={false} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Passenger left"
                  onClick={() => setOccupancy(bus.id, bus.occupied - 1)}
                >
                  <Minus className="size-4" />
                </Button>
                <div className="text-center">
                  <p className="num text-4xl font-extrabold text-foreground">{bus.occupied}</p>
                  <p className="num text-xs text-muted-foreground">of {bus.capacity} seats</p>
                </div>
                <Button
                  size="icon"
                  aria-label="Passenger boarded"
                  onClick={() => setOccupancy(bus.id, bus.occupied + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <Progress value={(bus.occupied / bus.capacity) * 100} />
              <p className="num text-center text-xs text-muted-foreground">
                {availableSeats(bus)} seats free
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Shift snapshot</h2>
              <dl className="num mt-3 space-y-2 text-sm">
                <Row k="Route" v={route ? `${route.code} · ${route.name}` : "—"} />
                <Row k="Speed" v={`${bus.speedKmh} km/h`} />
                <Row k="Punctuality" v={`${bus.punctualityPct}%`} />
                <Row k="Trips today" v={`${bus.onTimeTrips}/${bus.totalTrips}`} />
                <Row k="GPS accuracy" v={`±${bus.gpsAccuracyM} m`} />
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <div className="h-[360px] w-full lg:h-[460px]">
              <TransitMap
                buses={[bus]}
                routes={route ? [route] : []}
                stops={routeStops}
                selectedBusId={bus.id}
                highlightRouteId={bus.routeId}
              />
            </div>
          </div>

          {next && (
            <Card className="border-primary/40 bg-primary-soft">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    Next stop
                  </p>
                  <p className="text-base font-semibold text-foreground">{next.stop.name}</p>
                </div>
                <p className="num text-lg font-bold text-primary">{next.etaMin} min</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-border">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Stops ahead</h2>
              <ul className="mt-3 space-y-2">
                {coming.map((s) => (
                  <li
                    key={s.stop.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <span className="text-sm text-foreground">{s.stop.name}</span>
                    <span className="num text-xs text-muted-foreground">
                      {s.distanceKm} km · {s.etaMin} min
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold text-foreground">{v}</dd>
    </div>
  );
}
