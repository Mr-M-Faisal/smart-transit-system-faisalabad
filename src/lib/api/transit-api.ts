/**
 * Service / API layer.
 *
 * Every screen reads transit data through these functions. Today they resolve
 * from local mock data with simulated latency; when the Node.js + Express +
 * MongoDB backend is ready, swap the bodies for `fetch(...)` / Socket.IO calls
 * (and add the JWT header) without touching any component.
 *
 * e.g. const res = await fetch(`${API_BASE}/routes`, { headers: authHeader() })
 */
import {
  analytics,
  buses,
  drivers,
  routes,
  seedBookings,
  seedNotifications,
  seedReports,
  stops,
} from "../transit/mock-data";
import type { Booking, Bus, ConditionReport, Driver, Route, Stop } from "../transit/types";

export const API_BASE = "/api"; // replaced by the Express base URL later
export const SOCKET_URL = ""; // e.g. wss://api.smarttransit.pk — Socket.IO endpoint

const latency = <T,>(data: T, ms = 260): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export const transitApi = {
  getRoutes: () => latency<Route[]>(routes),
  getRoute: (id: string) => latency<Route | undefined>(routes.find((r) => r.id === id)),
  getStops: () => latency<Stop[]>(stops),
  getBuses: () => latency<Bus[]>(buses),
  getBus: (id: string) => latency<Bus | undefined>(buses.find((b) => b.id === id)),
  getDrivers: () => latency<Driver[]>(drivers),
  getBookings: () => latency<Booking[]>(seedBookings),
  getConditionReports: () => latency<ConditionReport[]>(seedReports),
  getNotifications: () => latency(seedNotifications),
  getAnalytics: () => latency(analytics, 320),
  /** Placeholder: real payment gateway (EasyPaisa / JazzCash) is not connected yet. */
  createPaymentIntent: (amount: number, method: "easypaisa" | "jazzcash") =>
    latency(
      {
        ok: true,
        reference: `${method === "easypaisa" ? "EP" : "JC"}-${Math.floor(1000000 + Math.random() * 8999999)}`,
        amount,
        simulated: true,
      },
      900,
    ),
};

export type TransitApi = typeof transitApi;
