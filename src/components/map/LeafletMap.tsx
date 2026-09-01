import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { Bus, Route, Stop } from "@/lib/transit/types";
import { occupancyLevel } from "@/lib/transit/utils";
import { CITY_CENTER } from "@/lib/transit/mock-data";

export type LeafletMapProps = {
  buses: Bus[];
  routes: Route[];
  stops: Stop[];
  selectedBusId?: string | null;
  highlightRouteId?: string | null;
  onSelectBus?: (id: string) => void;
  onSelectStop?: (id: string) => void;
  showStops?: boolean;
  className?: string;
};

const levelColor: Record<string, string> = {
  available: "var(--success)",
  limited: "var(--warning)",
  full: "var(--destructive)",
};

function busIcon(bus: Bus, selected: boolean) {
  const color = levelColor[occupancyLevel(bus)];
  return L.divIcon({
    className: "transit-bus-marker",
    iconSize: [64, 30],
    iconAnchor: [32, 15],
    html: `
      <div style="
        display:flex;align-items:center;gap:4px;padding:3px 7px;border-radius:999px;
        background:var(--surface);color:var(--foreground);
        border:1.5px solid ${selected ? "var(--primary)" : "var(--border)"};
        box-shadow:${selected ? "0 0 0 4px color-mix(in oklab, var(--primary) 22%, transparent)" : "0 2px 6px rgba(15,23,42,.18)"};
        font:600 10px/1.1 var(--font-sans);white-space:nowrap;transition:all .8s linear;">
        <span style="width:7px;height:7px;border-radius:999px;background:${color};display:inline-block"></span>
        <span>${bus.number.replace("FSD-", "")}</span>
        <span style="transform:rotate(${bus.bearing}deg);font-size:9px;opacity:.65">▲</span>
      </div>`,
  });
}

function stopIcon(active: boolean) {
  return L.divIcon({
    className: "transit-bus-marker",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    html: `<div style="width:11px;height:11px;border-radius:999px;background:var(--surface);
      border:2.5px solid ${active ? "var(--primary)" : "var(--muted-foreground)"};
      box-shadow:0 1px 3px rgba(15,23,42,.25)"></div>`,
  });
}

function FitToSelection({ bus }: { bus?: Bus | null }) {
  const map = useMap();
  useEffect(() => {
    if (bus) map.flyTo([bus.lat, bus.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [bus?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function LeafletMap({
  buses,
  routes,
  stops,
  selectedBusId,
  highlightRouteId,
  onSelectBus,
  onSelectStop,
  showStops = true,
  className,
}: LeafletMapProps) {
  const selected = useMemo(
    () => buses.find((b) => b.id === selectedBusId) ?? null,
    [buses, selectedBusId],
  );

  const polylines = useMemo(
    () =>
      routes.map((route) => ({
        route,
        positions: route.stopIds
          .map((id) => stops.find((s) => s.id === id))
          .filter(Boolean)
          .map((s) => [s!.lat, s!.lng] as [number, number]),
      })),
    [routes, stops],
  );

  return (
    <MapContainer
      center={[CITY_CENTER.lat, CITY_CENTER.lng]}
      zoom={13}
      scrollWheelZoom
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {polylines.map(({ route, positions }) => {
        const active = !highlightRouteId || highlightRouteId === route.id;
        return (
          <Polyline
            key={route.id}
            positions={positions}
            pathOptions={{
              color: active ? "var(--primary)" : "var(--muted-foreground)",
              weight: active ? 4 : 2,
              opacity: active ? 0.75 : 0.22,
            }}
          />
        );
      })}

      {showStops &&
        stops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={stopIcon(
              !!highlightRouteId &&
                !!routes.find((r) => r.id === highlightRouteId)?.stopIds.includes(stop.id),
            )}
            eventHandlers={{ click: () => onSelectStop?.(stop.id) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {stop.name}
            </Tooltip>
          </Marker>
        ))}

      {buses.map((bus) => (
        <Marker
          key={bus.id}
          position={[bus.lat, bus.lng]}
          icon={busIcon(bus, bus.id === selectedBusId)}
          zIndexOffset={bus.id === selectedBusId ? 1000 : 0}
          eventHandlers={{ click: () => onSelectBus?.(bus.id) }}
        >
          <Tooltip direction="top" offset={[0, -12]}>
            {bus.number} · {bus.capacity - bus.occupied} seats free
          </Tooltip>
        </Marker>
      ))}

      <FitToSelection bus={selected} />
    </MapContainer>
  );
}
