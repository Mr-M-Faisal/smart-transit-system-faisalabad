import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  BusFront,
  CreditCard,
  MapPinned,
  ShieldCheck,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransitMap } from "@/components/map/TransitMap";
import { BusCard } from "@/components/transit/BusCard";
import { RouteBadge } from "@/components/transit/primitives";
import { useStore } from "@/lib/store/app-store";
import { formatPKR } from "@/lib/transit/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Transit Faisalabad — Live Bus Tracking & Seat Booking" },
      {
        name: "description",
        content:
          "Track Faisalabad city buses in real time, see live seat availability, book seats with EasyPaisa or JazzCash, and share your ride for safety.",
      },
      { property: "og:title", content: "Smart Transit Faisalabad — Live Bus Tracking" },
      {
        property: "og:description",
        content:
          "Real-time GPS bus tracking, live occupancy, seat booking and safety sharing for Faisalabad commuters.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: MapPinned,
    title: "Live GPS tracking",
    body: "Follow every bus on the map with 2-second position updates, bearing and accurate ETAs to your stop.",
  },
  {
    icon: Users,
    title: "Real-time occupancy",
    body: "See how full a bus is before it arrives — available, limited or full — and skip the crowded ones.",
  },
  {
    icon: Ticket,
    title: "Seat-level booking",
    body: "Pick your exact seat on an interactive bus layout and get an instant QR boarding pass.",
  },
  {
    icon: CreditCard,
    title: "EasyPaisa & JazzCash",
    body: "Pay fares with the wallets you already use. Every trip receipt lands in your notifications.",
  },
  {
    icon: ShieldCheck,
    title: "Journey safety sharing",
    body: "Share a live trip link with family and raise an emergency alert with one tap.",
  },
  {
    icon: BellRing,
    title: "Smart alerts",
    body: "Bus-approaching pings, route diversions, payment receipts and no-show warnings.",
  },
];

function Home() {
  const { buses, routes, stops } = useStore();
  const activeBuses = buses.filter((b) => b.status !== "off-duty");
  const featured = [...buses]
    .filter((b) => b.status === "on-trip")
    .sort((a, b) => b.trustScore - a.trustScore)
    .slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="section grid gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              {activeBuses.length} buses live across Faisalabad
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
              Know exactly when your bus arrives —{" "}
              <span className="text-primary">and if there's a seat.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              Smart Transit brings GPS tracking, live occupancy and seat booking to Faisalabad's
              public bus network. No more guessing at the stop.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/track">
                  <MapPinned className="size-4" /> Track buses live
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/book" search={{}}>
                  <Ticket className="size-4" /> Book a seat
                </Link>
              </Button>
            </div>
            <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { k: "Routes", v: routes.length },
                { k: "Stops covered", v: stops.length },
                { k: "Fleet buses", v: buses.length },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{s.k}</dt>
                  <dd className="num mt-1 text-2xl font-bold text-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border shadow-panel">
            <div className="h-[380px] w-full lg:h-[440px]">
              <TransitMap buses={buses} routes={routes} stops={stops} showStops={false} />
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Live fleet positions · updated live</p>
              <Link
                to="/track"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                Open full map <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section py-14">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Everything a commuter needs
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Built for passengers, drivers and transport authorities — one platform, three tailored
          experiences.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="border-border shadow-card">
              <CardContent className="p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular routes */}
      <section className="border-y border-border bg-surface py-14">
        <div className="section">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Popular routes</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Six city corridors connecting the Clock Tower, Madina Town, UAF and beyond.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link to="/routes">All routes</Link>
            </Button>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routes.slice(0, 6).map((route) => (
              <Link key={route.id} to="/routes/$routeId" params={{ routeId: route.id }}>
                <Card className="h-full border-border transition-all hover:border-primary hover:shadow-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <RouteBadge code={route.code} />
                      <span className="num text-sm font-bold text-foreground">
                        {formatPKR(route.fare)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-foreground">{route.name}</h3>
                    <p className="num mt-1 text-xs text-muted-foreground">
                      {route.stopIds.length} stops · {route.distanceKm} km · every{" "}
                      {route.headwayMin} min
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Buses now */}
      <section className="section py-14">
        <div className="flex items-center gap-2">
          <BusFront className="size-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Most reliable buses right now</h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((bus) => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section pb-16">
        <div className="rounded-2xl bg-primary px-6 py-10 text-center shadow-panel sm:px-12">
          <TrendingUp className="mx-auto size-8 text-primary-foreground" />
          <h2 className="mt-4 text-2xl font-bold text-primary-foreground sm:text-3xl">
            Run the network, not the guesswork
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-primary-foreground/80">
            Drivers manage shifts and occupancy; authorities monitor fleet health, GPS reliability
            and ridership analytics from one dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/driver">Driver console</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/admin">Admin dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
