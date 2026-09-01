import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  buses as seedBuses,
  drivers as seedDrivers,
  positionOnRoute,
  routes as seedRoutes,
  seedBookings,
  seedNotifications,
  seedReports,
  stops as seedStops,
} from "../transit/mock-data";
import type {
  Booking,
  Bus,
  ConditionReport,
  Driver,
  Route,
  SafetySession,
  Session,
  Stop,
  TransitNotification,
} from "../transit/types";

const STORAGE_KEY = "smart-transit-state-v1";

type PersistedState = {
  session: Session | null;
  bookings: Booking[];
  notifications: TransitNotification[];
  reports: ConditionReport[];
  safety: SafetySession | null;
  shiftActive: boolean;
  driverBusId: string;
};

type StoreValue = PersistedState & {
  hydrated: boolean;
  buses: Bus[];
  routes: Route[];
  stops: Stop[];
  drivers: Driver[];
  liveEnabled: boolean;
  setLiveEnabled: (v: boolean) => void;
  login: (session: Session) => void;
  logout: () => void;
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
  addReport: (report: ConditionReport) => void;
  setReportStatus: (id: string, status: ConditionReport["status"]) => void;
  pushNotification: (n: Omit<TransitNotification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  startSafety: (s: Omit<SafetySession, "id" | "startedAt" | "link">) => void;
  stopSafety: () => void;
  setShiftActive: (v: boolean) => void;
  setDriverBusId: (id: string) => void;
  setOccupancy: (busId: string, occupied: number) => void;
  upsertBus: (bus: Bus) => void;
  removeBus: (id: string) => void;
  upsertRoute: (route: Route) => void;
  removeRoute: (id: string) => void;
  upsertStop: (stop: Stop) => void;
  removeStop: (id: string) => void;
  upsertDriver: (driver: Driver) => void;
  removeDriver: (id: string) => void;
};

const defaults: PersistedState = {
  session: null,
  bookings: seedBookings,
  notifications: seedNotifications,
  reports: seedReports,
  safety: null,
  shiftActive: false,
  driverBusId: "bus-01",
};

const StoreContext = createContext<StoreValue | null>(null);

const uid = (prefix: string) =>
  `${prefix}-${Math.floor(10000 + Math.random() * 89999)}`;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [buses, setBuses] = useState<Bus[]>(seedBuses);
  const [routes, setRoutes] = useState<Route[]>(seedRoutes);
  const [stops, setStops] = useState<Stop[]>(seedStops);
  const [drivers, setDrivers] = useState<Driver[]>(seedDrivers);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const tick = useRef(0);

  // Hydrate persisted state after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...defaults, ...(JSON.parse(raw) as PersistedState) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  /**
   * Simulated real-time GPS feed. Replace this interval with Socket.IO:
   *   socket.on("bus:update", (payload) => setBuses(applyUpdate(payload)))
   */
  useEffect(() => {
    if (!liveEnabled) return;
    const id = window.setInterval(() => {
      tick.current += 1;
      setBuses((prev) =>
        prev.map((bus) => {
          if (bus.status === "off-duty" || bus.status === "idle") return bus;
          const speed = bus.status === "delayed" ? 10 + Math.random() * 8 : 18 + Math.random() * 34;
          const step = (speed / 3600) * 2 / Math.max(6, 12); // normalized progress per tick
          const progress = (bus.progress + step) % 1;
          const pos = positionOnRoute(bus.routeId, progress);
          const drift = Math.round((Math.random() - 0.5) * 2);
          const occupied = Math.min(
            bus.capacity,
            Math.max(0, tick.current % 5 === 0 ? bus.occupied + drift : bus.occupied),
          );
          return {
            ...bus,
            progress,
            lat: pos.lat,
            lng: pos.lng,
            bearing: pos.bearing,
            speedKmh: Math.round(speed),
            occupied,
            lastUpdated: new Date().toISOString(),
          };
        }),
      );
    }, 2000);
    return () => window.clearInterval(id);
  }, [liveEnabled]);

  const patch = useCallback((p: Partial<PersistedState>) => {
    setState((prev) => ({ ...prev, ...p }));
  }, []);

  const value = useMemo<StoreValue>(() => {
    const pushNotification: StoreValue["pushNotification"] = (n) =>
      setState((prev) => ({
        ...prev,
        notifications: [
          { ...n, id: uid("nt"), createdAt: new Date().toISOString(), read: false },
          ...prev.notifications,
        ],
      }));

    return {
      ...state,
      hydrated,
      buses,
      routes,
      stops,
      drivers,
      liveEnabled,
      setLiveEnabled,
      login: (session) => patch({ session }),
      logout: () => patch({ session: null, shiftActive: false }),
      addBooking: (booking) =>
        setState((prev) => ({
          ...prev,
          bookings: [booking, ...prev.bookings],
          notifications: [
            {
              id: uid("nt"),
              kind: "booking",
              title: "Booking confirmed",
              body: `Seat ${booking.seats.join(", ")} on ${booking.busNumber} (${booking.routeName}).`,
              createdAt: new Date().toISOString(),
              read: false,
            },
            {
              id: uid("nt"),
              kind: "payment",
              title: "Payment received",
              body: `PKR ${booking.fare} via ${booking.paymentMethod === "easypaisa" ? "EasyPaisa" : "JazzCash"} · Ref ${booking.paymentRef}.`,
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...prev.notifications,
          ],
        })),
      cancelBooking: (id) =>
        setState((prev) => ({
          ...prev,
          bookings: prev.bookings.map((b) =>
            b.id === id ? { ...b, status: "cancelled" } : b,
          ),
        })),
      addReport: (report) =>
        setState((prev) => ({ ...prev, reports: [report, ...prev.reports] })),
      setReportStatus: (id, status) =>
        setState((prev) => ({
          ...prev,
          reports: prev.reports.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
      pushNotification,
      markAllRead: () =>
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => ({ ...n, read: true })),
        })),
      markRead: (id) =>
        setState((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      startSafety: (s) => {
        const id = uid("sf");
        patch({
          safety: {
            ...s,
            id,
            startedAt: new Date().toISOString(),
            link: `https://smarttransit.pk/s/${id.toLowerCase()}`,
          },
        });
      },
      stopSafety: () => patch({ safety: null }),
      setShiftActive: (v) => patch({ shiftActive: v }),
      setDriverBusId: (id) => patch({ driverBusId: id }),
      setOccupancy: (busId, occupied) =>
        setBuses((prev) =>
          prev.map((b) =>
            b.id === busId
              ? { ...b, occupied: Math.min(b.capacity, Math.max(0, occupied)) }
              : b,
          ),
        ),
      upsertBus: (bus) =>
        setBuses((prev) =>
          prev.some((b) => b.id === bus.id)
            ? prev.map((b) => (b.id === bus.id ? bus : b))
            : [bus, ...prev],
        ),
      removeBus: (id) => setBuses((prev) => prev.filter((b) => b.id !== id)),
      upsertRoute: (route) =>
        setRoutes((prev) =>
          prev.some((r) => r.id === route.id)
            ? prev.map((r) => (r.id === route.id ? route : r))
            : [route, ...prev],
        ),
      removeRoute: (id) => setRoutes((prev) => prev.filter((r) => r.id !== id)),
      upsertStop: (stop) =>
        setStops((prev) =>
          prev.some((s) => s.id === stop.id)
            ? prev.map((s) => (s.id === stop.id ? stop : s))
            : [stop, ...prev],
        ),
      removeStop: (id) => setStops((prev) => prev.filter((s) => s.id !== id)),
      upsertDriver: (driver) =>
        setDrivers((prev) =>
          prev.some((d) => d.id === driver.id)
            ? prev.map((d) => (d.id === driver.id ? driver : d))
            : [driver, ...prev],
        ),
      removeDriver: (id) => setDrivers((prev) => prev.filter((d) => d.id !== id)),
    };
  }, [state, hydrated, buses, routes, stops, drivers, liveEnabled, patch]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <AppStoreProvider>");
  return ctx;
}

export function useBus(id: string | undefined) {
  const { buses } = useStore();
  return id ? buses.find((b) => b.id === id) : undefined;
}
