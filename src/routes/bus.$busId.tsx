import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Gauge, Satellite, ShieldCheck, Ticket, Users } from "lucide-react";
import { PageHeader, OccupancyBadge, StatusPill, RouteBadge, EmptyState } from "@/components/transit/primitives";
import { TransitMap } from "@/components/map/TransitMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store/app-store";
import { availableSeats, formatPKR, nextStopInfo, relativeTime, trustLevel, upcomingStops } from "@/lib/transit/utils";

export const Route = createFileRoute("/bus/$busId")({
  head: () => ({
    meta: [
      { title: "Bus details & live ETA — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "Live position, speed, occupancy, trust score and upcoming stop ETAs for this Faisalabad city bus.",
      },
      { property: "og:title", content: "Bus details & live ETA — Smart Transit" },
      {
        property: "og:description",
        content: "Track this bus in real time and check seat availability before it arrives.",
      },
    ],
  }),
  component: BusDetail,
  notFoundComponent: () => (
    <div className="section py-16">
      <EmptyState
        title="Bus not found"
        description="This vehicle is no longer in the fleet."
        action={
          <Button asChild variant="outline">
            <Link to="/track">Back to live map</Link>
          </Button>
        }
      />
    </div>
  ),
});

function BusDetail() {
  const { busId } = Route.useParams();
  const { buses, routes, stops, drivers } = useStore();
  const bus = buses.find((b) => b.id === busId);
  if (!bus) throw notFound();

  const route = routes.find((r) => r.id === bus.routeId);
  const driver = drivers.find((d) => d.id === bus.driverId);
  const next = nextStopInfo(bus);
  const coming = upcomingStops(bus, 4);
  const trust = trustLevel(bus.trustScore);
  const routeStops = route
    ? route.stopIds
        .map((id) => stops.find((s) => s.id === id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s))
    : [];

  return (
    <div className="section py-8">
      <Link
        to="/track"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Live map
      </Link>

      <div className="mt-3">
        <PageHeader
          eyebrow={route ? `${route.code} · ${route.name}` : "Unassigned"}
          title={`Bus ${bus.number}`}
          subtitle={`Plate ${bus.plate} · ${bus.ac ? "Air-conditioned" : "Non-AC"} · updated ${relativeTime(bus.lastUpdated)}`}
          actions={
            <div className="flex items-center gap-2">
              <StatusPill status={bus.status} />
              <Button asChild>
                <Link to="/book" search={{ busId: bus.id }}>
                  <Ticket className="size-4" /> Book a seat
                </Link>
              </Button>
            </div>
          }
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <div className="h-[340px] w-full lg:h-[420px]">
              <TransitMap
                buses={[bus]}
                routes={route ? [route] : []}
                stops={routeStops}
                selectedBusId={bus.id}
                highlightRouteId={bus.routeId}
              />
            </div>
          </div>

          <Card className="border-border">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Upcoming stops</h2>
              <ul className="mt-4 space-y-3">
                {coming.map((s, i) => (
                  <li key={s.stop.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          i === 0
                            ? "grid size-7 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                            : "grid size-7 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground"
                        }
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.stop.name}</p>
                        <p className="text-xs text-muted-foreground">{s.stop.area}</p>
                      </div>
                    </div>
                    <span className="num text-sm font-semibold text-primary">{s.etaMin} min</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Users className="size-4 text-primary" /> Occupancy
                </span>
                <OccupancyBadge bus={bus} />
              </div>
              <Progress value={(bus.occupied / bus.capacity) * 100} />
              <p className="num text-xs text-muted-foreground">
                {bus.occupied}/{bus.capacity} seats taken · {availableSeats(bus)} free
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="grid grid-cols-2 gap-4 p-5">
              <Metric icon={Gauge} label="Speed" value={`${bus.speedKmh} km/h`} />
              <Metric
                icon={Satellite}
                label="GPS accuracy"
                value={`±${bus.gpsAccuracyM} m`}
              />
              <Metric
                icon={ShieldCheck}
                label={`Trust · ${trust.label}`}
                value={`${bus.trustScore}%`}
              />
              <Metric icon={Ticket} label="Fare" value={route ? formatPKR(route.fare) : "—"} />
            </CardContent>
          </Card>

          {next && (
            <Card className="border-primary/40 bg-primary-soft">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  Next stop
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">{next.stop.name}</p>
                <p className="num text-sm text-primary">Arriving in ~{next.etaMin} min</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-border">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Performance</h2>
              <dl className="num mt-3 space-y-2 text-sm">
                <Row k="Punctuality" v={`${bus.punctualityPct}%`} />
                <Row k="On-time trips" v={`${bus.onTimeTrips}/${bus.totalTrips}`} />
                <Row k="Direction" v={bus.direction} />
              </dl>
            </CardContent>
          </Card>

          {driver && (
            <Card className="border-border">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-foreground">Driver</h2>
                <p className="mt-2 text-sm font-medium text-foreground">{driver.name}</p>
                <p className="num text-xs text-muted-foreground">
                  Licence {driver.licenseNo} · {driver.experienceYears} yrs · ★ {driver.rating}
                </p>
                {route && (
                  <div className="mt-3">
                    <RouteBadge code={route.code} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5 text-primary" /> {label}
      </p>
      <p className="num mt-1 text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold capitalize text-foreground">{v}</dd>
    </div>
  );
}
