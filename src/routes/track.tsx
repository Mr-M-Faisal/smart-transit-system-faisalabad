import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Radio, Search, SlidersHorizontal } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/transit/primitives";
import { BusCard } from "@/components/transit/BusCard";
import { TransitMap } from "@/components/map/TransitMap";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store/app-store";
import { occupancyLevel } from "@/lib/transit/utils";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Live Bus Map — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "Follow every Faisalabad city bus on a live GPS map with seat availability, speed and ETAs to the next stop.",
      },
      { property: "og:title", content: "Live Bus Map — Smart Transit Faisalabad" },
      {
        property: "og:description",
        content: "Real-time positions, occupancy and ETAs for the whole Faisalabad bus fleet.",
      },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { buses, routes, stops, liveEnabled, setLiveEnabled } = useStore();
  const [query, setQuery] = useState("");
  const [routeId, setRouteId] = useState("all");
  const [occupancy, setOccupancy] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      buses.filter((bus) => {
        const route = routes.find((r) => r.id === bus.routeId);
        const q = query.trim().toLowerCase();
        const matchQ =
          !q ||
          bus.number.toLowerCase().includes(q) ||
          (route?.name ?? "").toLowerCase().includes(q) ||
          (route?.code ?? "").toLowerCase().includes(q);
        const matchRoute = routeId === "all" || bus.routeId === routeId;
        const matchOcc = occupancy === "all" || occupancyLevel(bus) === occupancy;
        return matchQ && matchRoute && matchOcc;
      }),
    [buses, routes, query, routeId, occupancy],
  );

  return (
    <div className="section py-8">
      <PageHeader
        eyebrow="Real-time"
        title="Live bus map"
        subtitle="Positions refresh every couple of seconds from the GPS feed. Tap a bus to focus it on the map."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Radio className="size-4 text-primary" />
            <Label htmlFor="live" className="text-xs font-medium">
              Live updates
            </Label>
            <Switch id="live" checked={liveEnabled} onCheckedChange={setLiveEnabled} />
          </div>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="h-[420px] w-full lg:h-[640px]">
            <TransitMap
              buses={filtered}
              routes={routes}
              stops={stops}
              selectedBusId={selected}
              highlightRouteId={routeId === "all" ? null : routeId}
              onSelectBus={setSelected}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <SlidersHorizontal className="size-4 text-primary" /> Filters
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bus or route…"
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={routeId} onValueChange={setRouteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All routes</SelectItem>
                  {routes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.code} · {r.from}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={occupancy} onValueChange={setOccupancy}>
                <SelectTrigger>
                  <SelectValue placeholder="Occupancy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any occupancy</SelectItem>
                  <SelectItem value="available">Seats available</SelectItem>
                  <SelectItem value="limited">Limited seats</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="num text-xs text-muted-foreground">
              Showing {filtered.length} of {buses.length} buses
            </p>
          </div>

          <div className="space-y-3 lg:max-h-[480px] lg:overflow-y-auto lg:pr-1">
            {filtered.length ? (
              filtered.map((bus) => (
                <BusCard
                  key={bus.id}
                  bus={bus}
                  selected={selected === bus.id}
                  onSelect={setSelected}
                />
              ))
            ) : (
              <EmptyState
                title="No buses match these filters"
                description="Try clearing the occupancy filter or picking another route."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
