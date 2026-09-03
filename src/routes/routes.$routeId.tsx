import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, Ticket } from "lucide-react";
import { PageHeader, RouteBadge, EmptyState } from "@/components/transit/primitives";
import { BusCard } from "@/components/transit/BusCard";
import { TransitMap } from "@/components/map/TransitMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store/app-store";
import { formatPKR } from "@/lib/transit/utils";

export const Route = createFileRoute("/routes/$routeId")({
  head: ({ params }) => ({
    meta: [
      { title: `Route ${params.routeId.replace("route-", "").toUpperCase()} — Smart Transit` },
      {
        name: "description",
        content: "Stop-by-stop route detail, fare, timings and the buses running it right now.",
      },
      { property: "og:title", content: "Route detail — Smart Transit Faisalabad" },
      {
        property: "og:description",
        content: "Stops, fare, headway and live buses for this Faisalabad bus route.",
      },
    ],
  }),
  component: RouteDetail,
  notFoundComponent: () => (
    <div className="section py-16">
      <EmptyState
        title="Route not found"
        description="This route is no longer part of the network."
        action={
          <Button asChild variant="outline">
            <Link to="/routes">Back to routes</Link>
          </Button>
        }
      />
    </div>
  ),
});

function RouteDetail() {
  const { routeId } = Route.useParams();
  const { routes, stops, buses } = useStore();
  const route = routes.find((r) => r.id === routeId);
  if (!route) throw notFound();

  const routeStopList = route.stopIds
    .map((id) => stops.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const routeBuses = buses.filter((b) => b.routeId === route.id);

  return (
    <div className="section py-8">
      <Link
        to="/routes"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All routes
      </Link>

      <div className="mt-3">
        <PageHeader
          eyebrow={route.code}
          title={route.name}
          subtitle={`${route.from} → ${route.to} · ${route.distanceKm} km · ${route.stopIds.length} stops`}
          actions={
            <Button asChild>
              <Link to="/book">
                <Ticket className="size-4" /> Book on this route
              </Link>
            </Button>
          }
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Fare", value: formatPKR(route.fare) },
          { label: "Frequency", value: `Every ${route.headwayMin} min` },
          { label: "Service hours", value: `${route.firstBus} – ${route.lastBus}` },
          { label: "Buses live", value: `${routeBuses.filter((b) => b.status !== "off-duty").length}` },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="num mt-1 text-lg font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_400px]">
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="h-[380px] w-full lg:h-[520px]">
            <TransitMap
              buses={routeBuses}
              routes={[route]}
              stops={routeStopList}
              highlightRouteId={route.id}
            />
          </div>
        </div>

        <div className="space-y-5">
          <Card className="border-border">
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="size-4 text-primary" /> Stops in order
              </h2>
              <ol className="mt-4 space-y-0">
                {routeStopList.map((stop, i) => (
                  <li key={stop.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 size-2.5 rounded-full border-2 border-primary bg-background" />
                      {i < routeStopList.length - 1 && (
                        <span className="w-px flex-1 bg-border" aria-hidden />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-foreground">{stop.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {stop.area}
                        {stop.landmark ? ` · ${stop.landmark}` : ""}
                        {stop.shelter ? " · Shelter" : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="size-4 text-primary" /> Buses on this route
            </h2>
            <div className="mt-3 space-y-3">
              {routeBuses.length ? (
                routeBuses.map((bus) => <BusCard key={bus.id} bus={bus} />)
              ) : (
                <EmptyState
                  title="No buses assigned"
                  description="Buses will appear here once they start their shift."
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
