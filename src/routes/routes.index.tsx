import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Search } from "lucide-react";
import { PageHeader, RouteBadge, EmptyState } from "@/components/transit/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store/app-store";
import { formatPKR } from "@/lib/transit/utils";

export const Route = createFileRoute("/routes/")({
  head: () => ({
    meta: [
      { title: "Bus Routes & Fares — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "Browse all Faisalabad bus routes with stops, fares, distance, headway and first/last bus timings.",
      },
      { property: "og:title", content: "Bus Routes & Fares — Smart Transit Faisalabad" },
      {
        property: "og:description",
        content: "Every city corridor with stop lists, fares and service timings.",
      },
    ],
  }),
  component: RoutesPage,
});

function RoutesPage() {
  const { routes, buses } = useStore();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const list = routes.filter(
    (r) =>
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.code.toLowerCase().includes(term) ||
      r.from.toLowerCase().includes(term) ||
      r.to.toLowerCase().includes(term),
  );

  return (
    <div className="section py-8">
      <PageHeader
        eyebrow="Network"
        title="Routes & fares"
        subtitle="Six corridors covering the old city, Madina Town, Jail Road, Sargodha Road and the outskirts."
      />

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by route, origin or destination…"
          className="pl-9"
        />
      </div>

      {list.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((route) => {
            const live = buses.filter((b) => b.routeId === route.id && b.status !== "off-duty");
            return (
              <Card key={route.id} className="border-border shadow-card">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <RouteBadge code={route.code} />
                      <h2 className="mt-2 text-base font-semibold text-foreground">{route.name}</h2>
                    </div>
                    <span className="num rounded-lg bg-muted px-2.5 py-1 text-sm font-bold text-foreground">
                      {formatPKR(route.fare)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" /> {route.from} → {route.to}
                    </p>
                    <p className="num flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" /> {route.firstBus} – {route.lastBus}{" "}
                      · every {route.headwayMin} min
                    </p>
                  </div>

                  <div className="num grid grid-cols-3 gap-2 rounded-lg bg-muted p-2.5 text-center">
                    <div>
                      <p className="text-sm font-bold text-foreground">{route.stopIds.length}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">Stops</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{route.distanceKm}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">km</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-success">{live.length}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">Live</p>
                    </div>
                  </div>

                  <Link
                    to="/routes/$routeId"
                    params={{ routeId: route.id }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    View stops & live buses <ArrowRight className="size-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState title="No routes found" description="Try a different search term." />
        </div>
      )}
    </div>
  );
}
