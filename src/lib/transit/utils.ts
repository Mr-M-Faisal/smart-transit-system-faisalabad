import type { Bus, OccupancyLevel, Route, Stop } from "./types";
import { positionOnRoute, routeById, stopById } from "./mock-data";

export const toRad = (v: number) => (v * Math.PI) / 180;

/** Haversine distance in km */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function occupancyLevel(bus: Pick<Bus, "occupied" | "capacity">): OccupancyLevel {
  const pct = (bus.occupied / bus.capacity) * 100;
  if (pct >= 100) return "full";
  if (pct >= 75) return "limited";
  return "available";
}

export const occupancyMeta: Record<
  OccupancyLevel,
  { label: string; text: string; bg: string; dot: string }
> = {
  available: {
    label: "Seats available",
    text: "text-success",
    bg: "bg-success-soft",
    dot: "bg-success",
  },
  limited: {
    label: "Limited seats",
    text: "text-warning-foreground",
    bg: "bg-warning-soft",
    dot: "bg-warning",
  },
  full: {
    label: "Bus full",
    text: "text-destructive",
    bg: "bg-destructive-soft",
    dot: "bg-destructive",
  },
};

export function availableSeats(bus: Pick<Bus, "occupied" | "capacity">) {
  return Math.max(bus.capacity - bus.occupied, 0);
}

export function occupancyPct(bus: Pick<Bus, "occupied" | "capacity">) {
  return Math.round((bus.occupied / bus.capacity) * 100);
}

/** Ordered stops of a route */
export function routeStops(route: Route): Stop[] {
  return route.stopIds.map((id) => stopById(id)!).filter(Boolean);
}

/** Upcoming stops for a bus, given its progress along the route path. */
export function upcomingStops(bus: Bus, count = 3) {
  const route = routeById(bus.routeId);
  if (!route) return [];
  const stops = routeStops(route);
  const { segment } = positionOnRoute(bus.routeId, bus.progress);
  const ordered = bus.direction === "outbound" ? stops : [...stops].reverse();
  const idx = bus.direction === "outbound" ? segment + 1 : stops.length - 1 - segment;
  const list = ordered.slice(Math.max(idx, 0));
  const result: { stop: Stop; distanceKm: number; etaMin: number }[] = [];
  let cursor = { lat: bus.lat, lng: bus.lng };
  let cumulative = 0;
  const speed = Math.max(bus.speedKmh, 14);
  for (const stop of list.slice(0, count)) {
    const d = distanceKm(cursor, stop);
    cumulative += d;
    result.push({
      stop,
      distanceKm: Number(cumulative.toFixed(1)),
      etaMin: Math.max(1, Math.round((cumulative / speed) * 60 + 1)),
    });
    cursor = { lat: stop.lat, lng: stop.lng };
  }
  return result;
}

export function nextStopInfo(bus: Bus) {
  return upcomingStops(bus, 1)[0] ?? null;
}

export function trustLevel(score: number) {
  if (score >= 90) return { label: "Highly reliable", tone: "success" as const };
  if (score >= 75) return { label: "Reliable", tone: "primary" as const };
  if (score >= 60) return { label: "Average", tone: "warning" as const };
  return { label: "Low reliability", tone: "destructive" as const };
}

export const formatPKR = (v: number) =>
  `PKR ${v.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true });

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

export const SEAT_ROWS = 11;
export const SEAT_COLS = ["A", "B", "C", "D"] as const;

export function seatLayout(capacity: number) {
  const rows = Math.ceil(capacity / 4);
  return Array.from({ length: rows }, (_, r) =>
    SEAT_COLS.map((c) => `${r + 1}${c}`).filter(
      (_, ci) => (r * 4 + ci) < capacity,
    ),
  );
}
