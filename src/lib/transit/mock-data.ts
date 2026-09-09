import type {
  Booking,
  Bus,
  ConditionReport,
  Driver,
  Route,
  Stop,
  TransitNotification,
} from "./types";

/** Faisalabad city centre */
export const CITY_CENTER = { lat: 31.4187, lng: 73.0791 };

export const stops: Stop[] = [
  { id: "st-01", name: "Ghanta Ghar (Clock Tower)", area: "Old City", lat: 31.4181, lng: 73.0776, landmark: "Eight Bazaars", shelter: true },
  { id: "st-02", name: "Rail Bazaar", area: "Old City", lat: 31.4155, lng: 73.0839, shelter: false },
  { id: "st-03", name: "Faisalabad Railway Station", area: "Civil Lines", lat: 31.4131, lng: 73.0929, landmark: "Main Station", shelter: true },
  { id: "st-04", name: "Jinnah Colony", area: "Jinnah Colony", lat: 31.4213, lng: 73.0895, shelter: true },
  { id: "st-05", name: "D Ground Chowk", area: "Peoples Colony", lat: 31.4083, lng: 73.1051, landmark: "D Ground Market", shelter: true },
  { id: "st-06", name: "Kohinoor City", area: "Jaranwala Road", lat: 31.4029, lng: 73.1213, landmark: "Kohinoor Plaza", shelter: true },
  { id: "st-07", name: "Susan Road", area: "Madina Town", lat: 31.4104, lng: 73.1128, shelter: false },
  { id: "st-08", name: "Madina Town", area: "Madina Town", lat: 31.4162, lng: 73.1176, shelter: true },
  { id: "st-09", name: "Millat Chowk", area: "Millat Town", lat: 31.4363, lng: 73.1004, shelter: true },
  { id: "st-10", name: "Sargodha Road Stop", area: "Sargodha Road", lat: 31.4468, lng: 73.1189, shelter: false },
  { id: "st-11", name: "University of Agriculture", area: "Jail Road", lat: 31.4297, lng: 73.0708, landmark: "UAF Main Gate", shelter: true },
  { id: "st-12", name: "Allied Hospital", area: "Jail Road", lat: 31.4258, lng: 73.0819, landmark: "Emergency Gate", shelter: true },
  { id: "st-13", name: "Samanabad", area: "Samanabad", lat: 31.4032, lng: 73.0669, shelter: false },
  { id: "st-14", name: "Batala Colony", area: "Batala Colony", lat: 31.4116, lng: 73.0961, shelter: true },
  { id: "st-15", name: "Abdullahpur", area: "Canal Road", lat: 31.4004, lng: 73.0937, landmark: "Canal Bridge", shelter: true },
  { id: "st-16", name: "Lyallpur Galleria", area: "Susan Road", lat: 31.4053, lng: 73.1163, shelter: true },
  { id: "st-17", name: "Nishatabad", area: "Sheikhupura Road", lat: 31.4494, lng: 73.0489, shelter: false },
  { id: "st-18", name: "Sitara Market", area: "Satiana Road", lat: 31.3946, lng: 73.1044, shelter: true },
  { id: "st-19", name: "NUML Faisalabad Campus", area: "Sargodha Road", lat: 31.4421, lng: 73.1102, landmark: "Campus Gate", shelter: true },
  { id: "st-20", name: "Dijkot Road Terminal", area: "Dijkot Road", lat: 31.3854, lng: 73.0665, shelter: true },
  { id: "st-21", name: "Jhang Road Bypass", area: "Jhang Road", lat: 31.3948, lng: 73.0398, shelter: false },
  { id: "st-22", name: "Gulberg Chowk", area: "Gulberg", lat: 31.4287, lng: 73.1067, shelter: true },
  { id: "st-23", name: "Punjab Medical College", area: "Jail Road", lat: 31.4226, lng: 73.0763, shelter: true },
  { id: "st-24", name: "Sahianwala Interchange", area: "M-4 Motorway", lat: 31.4661, lng: 73.1394, landmark: "M-4 Entry", shelter: false },
];

export const stopById = (id: string) => stops.find((s) => s.id === id);

export const routes: Route[] = [
  {
    id: "rt-01",
    code: "FR-1",
    name: "Clock Tower – Kohinoor City",
    from: "Ghanta Ghar (Clock Tower)",
    to: "Kohinoor City",
    stopIds: ["st-01", "st-02", "st-03", "st-14", "st-05", "st-07", "st-16", "st-06"],
    fare: 60,
    distanceKm: 12.4,
    headwayMin: 10,
    firstBus: "06:00",
    lastBus: "22:30",
    activeBuses: 4,
    color: "chart-1",
  },
  {
    id: "rt-02",
    code: "FR-2",
    name: "Millat Chowk – Samanabad",
    from: "Millat Chowk",
    to: "Samanabad",
    stopIds: ["st-09", "st-22", "st-12", "st-23", "st-01", "st-13"],
    fare: 45,
    distanceKm: 9.1,
    headwayMin: 12,
    firstBus: "06:15",
    lastBus: "21:45",
    activeBuses: 3,
    color: "chart-2",
  },
  {
    id: "rt-03",
    code: "FR-3",
    name: "UAF – Sitara Market",
    from: "University of Agriculture",
    to: "Sitara Market",
    stopIds: ["st-11", "st-23", "st-04", "st-14", "st-15", "st-18"],
    fare: 50,
    distanceKm: 10.2,
    headwayMin: 15,
    firstBus: "06:30",
    lastBus: "22:00",
    activeBuses: 3,
    color: "chart-3",
  },
  {
    id: "rt-04",
    code: "FR-4",
    name: "NUML Campus – Dijkot Road",
    from: "NUML Faisalabad Campus",
    to: "Dijkot Road Terminal",
    stopIds: ["st-19", "st-10", "st-22", "st-04", "st-01", "st-13", "st-20"],
    fare: 70,
    distanceKm: 15.6,
    headwayMin: 20,
    firstBus: "07:00",
    lastBus: "21:00",
    activeBuses: 2,
    color: "chart-4",
  },
  {
    id: "rt-05",
    code: "FR-5",
    name: "Nishatabad – Madina Town",
    from: "Nishatabad",
    to: "Madina Town",
    stopIds: ["st-17", "st-11", "st-12", "st-01", "st-03", "st-05", "st-08"],
    fare: 65,
    distanceKm: 14.0,
    headwayMin: 18,
    firstBus: "06:20",
    lastBus: "22:15",
    activeBuses: 2,
    color: "chart-5",
  },
  {
    id: "rt-06",
    code: "FR-6",
    name: "Sahianwala Interchange – Jhang Road",
    from: "Sahianwala Interchange",
    to: "Jhang Road Bypass",
    stopIds: ["st-24", "st-10", "st-09", "st-01", "st-13", "st-21"],
    fare: 80,
    distanceKm: 18.3,
    headwayMin: 25,
    firstBus: "06:45",
    lastBus: "20:30",
    activeBuses: 2,
    color: "chart-1",
  },
];

export const routeById = (id: string) => routes.find((r) => r.id === id);

export const drivers: Driver[] = [
  { id: "dr-01", name: "Muhammad Aslam", phone: "0300-6612884", licenseNo: "FSD-LTV-40213", busId: "bus-01", shift: "morning", status: "on-shift", rating: 4.7, experienceYears: 11 },
  { id: "dr-02", name: "Rizwan Haider", phone: "0301-4478120", licenseNo: "FSD-LTV-40388", busId: "bus-02", shift: "morning", status: "on-shift", rating: 4.4, experienceYears: 7 },
  { id: "dr-03", name: "Naveed Akhtar", phone: "0333-7712045", licenseNo: "FSD-LTV-41120", busId: "bus-03", shift: "evening", status: "on-shift", rating: 4.8, experienceYears: 14 },
  { id: "dr-04", name: "Zahid Mehmood", phone: "0345-9081223", licenseNo: "FSD-LTV-41567", busId: "bus-04", shift: "morning", status: "on-shift", rating: 4.1, experienceYears: 5 },
  { id: "dr-05", name: "Imran Bashir", phone: "0321-6650098", licenseNo: "FSD-LTV-41901", busId: "bus-05", shift: "evening", status: "on-shift", rating: 4.6, experienceYears: 9 },
  { id: "dr-06", name: "Shahid Iqbal", phone: "0308-1123774", licenseNo: "FSD-LTV-42045", busId: "bus-06", shift: "morning", status: "break", rating: 4.2, experienceYears: 6 },
  { id: "dr-07", name: "Kashif Nadeem", phone: "0312-8890561", licenseNo: "FSD-LTV-42233", busId: "bus-07", shift: "night", status: "on-shift", rating: 4.5, experienceYears: 8 },
  { id: "dr-08", name: "Adnan Sharif", phone: "0304-5540912", licenseNo: "FSD-LTV-42610", busId: "bus-08", shift: "evening", status: "on-shift", rating: 3.9, experienceYears: 4 },
  { id: "dr-09", name: "Waqar Younis Khan", phone: "0322-7781340", licenseNo: "FSD-LTV-42887", busId: "bus-09", shift: "morning", status: "on-shift", rating: 4.9, experienceYears: 16 },
  { id: "dr-10", name: "Tanveer Abbas", phone: "0334-2210467", licenseNo: "FSD-LTV-43012", busId: "bus-10", shift: "evening", status: "on-shift", rating: 4.3, experienceYears: 10 },
  { id: "dr-11", name: "Sajid Mahmood", phone: "0300-9987231", licenseNo: "FSD-LTV-43190", busId: "bus-11", shift: "morning", status: "on-shift", rating: 4.0, experienceYears: 3 },
  { id: "dr-12", name: "Faisal Rehman", phone: "0311-4432008", licenseNo: "FSD-LTV-43377", busId: "bus-12", shift: "night", status: "off-shift", rating: 4.4, experienceYears: 12 },
];

export const driverById = (id: string) => drivers.find((d) => d.id === id);

const occupiedSeatSet = (count: number, seed: number): string[] => {
  const rows = 11;
  const cols = ["A", "B", "C", "D"];
  const all: string[] = [];
  for (let r = 1; r <= rows; r++) for (const c of cols) all.push(`${r}${c}`);
  // Deterministic shuffle (no rejection loop) so seeding can never stall.
  let x = seed || 1;
  for (let i = all.length - 1; i > 0; i--) {
    x = (x * 1103515245 + 12345) % 2147483648;
    const j = x % (i + 1);
    const tmp = all[i]!;
    all[i] = all[j]!;
    all[j] = tmp;
  }
  return all.slice(0, Math.min(Math.max(count, 0), all.length));
};

type BusSeed = Omit<Bus, "lat" | "lng" | "bearing" | "lastUpdated" | "occupiedSeats">;

const busSeeds: BusSeed[] = [
  { id: "bus-01", number: "FSD-1204", plate: "FDB-1204", routeId: "rt-01", driverId: "dr-01", capacity: 44, occupied: 18, speedKmh: 34, progress: 0.18, direction: "outbound", status: "on-trip", trustScore: 92, punctualityPct: 94, onTimeTrips: 611, totalTrips: 650, gpsAccuracyM: 6, ac: true },
  { id: "bus-02", number: "FSD-1187", plate: "FDB-1187", routeId: "rt-01", driverId: "dr-02", capacity: 44, occupied: 39, speedKmh: 22, progress: 0.62, direction: "inbound", status: "on-trip", trustScore: 78, punctualityPct: 81, onTimeTrips: 478, totalTrips: 590, gpsAccuracyM: 9, ac: true },
  { id: "bus-03", number: "FSD-1332", plate: "FDB-1332", routeId: "rt-02", driverId: "dr-03", capacity: 40, occupied: 40, speedKmh: 0, progress: 0.44, direction: "outbound", status: "on-trip", trustScore: 88, punctualityPct: 90, onTimeTrips: 540, totalTrips: 600, gpsAccuracyM: 5, ac: false },
  { id: "bus-04", number: "FSD-1450", plate: "FDB-1450", routeId: "rt-02", driverId: "dr-04", capacity: 40, occupied: 12, speedKmh: 41, progress: 0.09, direction: "outbound", status: "on-trip", trustScore: 71, punctualityPct: 74, onTimeTrips: 333, totalTrips: 450, gpsAccuracyM: 14, ac: false },
  { id: "bus-05", number: "FSD-1509", plate: "FDB-1509", routeId: "rt-03", driverId: "dr-05", capacity: 36, occupied: 27, speedKmh: 28, progress: 0.71, direction: "inbound", status: "on-trip", trustScore: 85, punctualityPct: 87, onTimeTrips: 410, totalTrips: 471, gpsAccuracyM: 7, ac: true },
  { id: "bus-06", number: "FSD-1622", plate: "FDB-1622", routeId: "rt-03", driverId: "dr-06", capacity: 36, occupied: 4, speedKmh: 0, progress: 0.02, direction: "outbound", status: "idle", trustScore: 66, punctualityPct: 69, onTimeTrips: 210, totalTrips: 305, gpsAccuracyM: 21, ac: false },
  { id: "bus-07", number: "FSD-1710", plate: "FDB-1710", routeId: "rt-04", driverId: "dr-07", capacity: 44, occupied: 31, speedKmh: 47, progress: 0.35, direction: "outbound", status: "on-trip", trustScore: 90, punctualityPct: 92, onTimeTrips: 502, totalTrips: 546, gpsAccuracyM: 4, ac: true },
  { id: "bus-08", number: "FSD-1804", plate: "FDB-1804", routeId: "rt-04", driverId: "dr-08", capacity: 44, occupied: 43, speedKmh: 12, progress: 0.83, direction: "inbound", status: "delayed", trustScore: 58, punctualityPct: 61, onTimeTrips: 190, totalTrips: 312, gpsAccuracyM: 26, ac: true },
  { id: "bus-09", number: "FSD-1911", plate: "FDB-1911", routeId: "rt-05", driverId: "dr-09", capacity: 40, occupied: 16, speedKmh: 38, progress: 0.27, direction: "outbound", status: "on-trip", trustScore: 96, punctualityPct: 97, onTimeTrips: 703, totalTrips: 725, gpsAccuracyM: 3, ac: true },
  { id: "bus-10", number: "FSD-2033", plate: "FDB-2033", routeId: "rt-05", driverId: "dr-10", capacity: 40, occupied: 33, speedKmh: 25, progress: 0.55, direction: "inbound", status: "on-trip", trustScore: 82, punctualityPct: 84, onTimeTrips: 388, totalTrips: 462, gpsAccuracyM: 8, ac: false },
  { id: "bus-11", number: "FSD-2140", plate: "FDB-2140", routeId: "rt-06", driverId: "dr-11", capacity: 48, occupied: 21, speedKmh: 52, progress: 0.46, direction: "outbound", status: "on-trip", trustScore: 74, punctualityPct: 77, onTimeTrips: 254, totalTrips: 330, gpsAccuracyM: 11, ac: true },
  { id: "bus-12", number: "FSD-2251", plate: "FDB-2251", routeId: "rt-06", driverId: "dr-12", capacity: 48, occupied: 0, speedKmh: 0, progress: 0, direction: "outbound", status: "off-duty", trustScore: 80, punctualityPct: 83, onTimeTrips: 301, totalTrips: 363, gpsAccuracyM: 18, ac: true },
];

/** Full ordered coordinate path of a route (stop-to-stop polyline). */
export const routePath = (routeId: string) => {
  const route = routeById(routeId);
  if (!route) return [] as { lat: number; lng: number }[];
  return route.stopIds.map((id) => {
    const s = stopById(id)!;
    return { lat: s.lat, lng: s.lng };
  });
};

/** Position + bearing at a normalized progress value along the route path. */
export const positionOnRoute = (routeId: string, progress: number) => {
  const path = routePath(routeId);
  if (path.length < 2) return { lat: CITY_CENTER.lat, lng: CITY_CENTER.lng, bearing: 0, segment: 0 };
  const clamped = Math.min(Math.max(progress, 0), 0.9999);
  const total = path.length - 1;
  const scaled = clamped * total;
  const i = Math.floor(scaled);
  const t = scaled - i;
  const a = path[i]!;
  const b = path[i + 1]!;
  const lat = a.lat + (b.lat - a.lat) * t;
  const lng = a.lng + (b.lng - a.lng) * t;
  const bearing = (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180) / Math.PI;
  return { lat, lng, bearing, segment: i };
};

export const buses: Bus[] = busSeeds.map((seed, idx) => {
  const pos = positionOnRoute(seed.routeId, seed.progress);
  return {
    ...seed,
    lat: pos.lat,
    lng: pos.lng,
    bearing: pos.bearing,
    lastUpdated: new Date().toISOString(),
    occupiedSeats: occupiedSeatSet(seed.occupied, idx + 7),
  };
});

export const busById = (id: string) => buses.find((b) => b.id === id);

export const seedBookings: Booking[] = [
  {
    id: "BK-24081",
    passengerName: "Muhammad Faisal",
    passengerPhone: "0300-1234567",
    busId: "bus-01",
    busNumber: "FSD-1204",
    routeId: "rt-01",
    routeName: "Clock Tower – Kohinoor City",
    boardingStopId: "st-01",
    boardingStop: "Ghanta Ghar (Clock Tower)",
    destinationStopId: "st-06",
    destinationStop: "Kohinoor City",
    date: "2026-08-28",
    departureTime: "08:15",
    seats: ["4B"],
    fare: 60,
    status: "completed",
    paymentMethod: "easypaisa",
    paymentRef: "EP-9931204",
    createdAt: "2026-08-27T18:02:00.000Z",
  },
  {
    id: "BK-24102",
    passengerName: "Muhammad Faisal",
    passengerPhone: "0300-1234567",
    busId: "bus-09",
    busNumber: "FSD-1911",
    routeId: "rt-05",
    routeName: "Nishatabad – Madina Town",
    boardingStopId: "st-12",
    boardingStop: "Allied Hospital",
    destinationStopId: "st-08",
    destinationStop: "Madina Town",
    date: "2026-08-30",
    departureTime: "17:40",
    seats: ["2A", "2B"],
    fare: 130,
    status: "completed",
    paymentMethod: "jazzcash",
    paymentRef: "JC-4410877",
    createdAt: "2026-08-30T10:20:00.000Z",
  },
  {
    id: "BK-24119",
    passengerName: "Muhammad Faisal",
    passengerPhone: "0300-1234567",
    busId: "bus-05",
    busNumber: "FSD-1509",
    routeId: "rt-03",
    routeName: "UAF – Sitara Market",
    boardingStopId: "st-11",
    boardingStop: "University of Agriculture",
    destinationStopId: "st-18",
    destinationStop: "Sitara Market",
    date: "2026-08-24",
    departureTime: "09:05",
    seats: ["7C"],
    fare: 50,
    status: "no-show",
    paymentMethod: "easypaisa",
    paymentRef: "EP-9820114",
    createdAt: "2026-08-23T20:41:00.000Z",
  },
  {
    id: "BK-24127",
    passengerName: "Muhammad Faisal",
    passengerPhone: "0300-1234567",
    busId: "bus-07",
    busNumber: "FSD-1710",
    routeId: "rt-04",
    routeName: "NUML Campus – Dijkot Road",
    boardingStopId: "st-19",
    boardingStop: "NUML Faisalabad Campus",
    destinationStopId: "st-01",
    destinationStop: "Ghanta Ghar (Clock Tower)",
    date: "2026-08-21",
    departureTime: "16:10",
    seats: ["9A"],
    fare: 70,
    status: "cancelled",
    paymentMethod: "jazzcash",
    paymentRef: "JC-4390210",
    createdAt: "2026-08-20T12:15:00.000Z",
  },
];

export const seedReports: ConditionReport[] = [
  { id: "RC-3081", busId: "bus-03", busNumber: "FSD-1332", category: "air-conditioning", description: "AC not cooling between Millat Chowk and Allied Hospital during afternoon trips.", reportedBy: "Ayesha K.", createdAt: "2026-08-30T09:12:00.000Z", status: "open", severity: "medium" },
  { id: "RC-3079", busId: "bus-08", busNumber: "FSD-1804", category: "damaged-seat", description: "Seat 6D backrest is broken and folds backwards.", reportedBy: "Usman R.", createdAt: "2026-08-29T14:35:00.000Z", status: "in-review", severity: "high" },
  { id: "RC-3072", busId: "bus-06", busNumber: "FSD-1622", category: "cleanliness", description: "Floor not cleaned since morning shift, litter near rear door.", reportedBy: "Hina Z.", createdAt: "2026-08-28T07:50:00.000Z", status: "resolved", severity: "low" },
  { id: "RC-3065", busId: "bus-11", busNumber: "FSD-2140", category: "lighting", description: "Interior lights flicker on the Sahianwala night trip.", reportedBy: "Najaf T.", createdAt: "2026-08-27T21:05:00.000Z", status: "open", severity: "medium" },
];

export const seedNotifications: TransitNotification[] = [
  { id: "nt-01", kind: "bus-approaching", title: "FSD-1204 is 3 minutes away", body: "Your bus on FR-1 is approaching Ghanta Ghar (Clock Tower).", createdAt: "2026-09-01T06:52:00.000Z", read: false },
  { id: "nt-02", kind: "route-change", title: "FR-2 diverted at Jail Road", body: "Due to road works, FR-2 skips Punjab Medical College until 18:00. ETAs updated.", createdAt: "2026-09-01T06:20:00.000Z", read: false },
  { id: "nt-03", kind: "payment", title: "Payment received", body: "PKR 130 received via JazzCash for booking BK-24102.", createdAt: "2026-08-30T10:21:00.000Z", read: true },
  { id: "nt-04", kind: "no-show", title: "No-show recorded", body: "Booking BK-24119 was marked as no-show. Two more may restrict new bookings.", createdAt: "2026-08-24T09:40:00.000Z", read: true },
  { id: "nt-05", kind: "service", title: "Extended service on FR-5", body: "FR-5 will operate until 23:00 during the Lyallpur festival week.", createdAt: "2026-08-26T11:00:00.000Z", read: true },
];

/** Analytics series (mock, backend-ready shapes) */
export const analytics = {
  occupancyByDay: [
    { day: "Mon", occupancy: 62, trips: 148 },
    { day: "Tue", occupancy: 68, trips: 155 },
    { day: "Wed", occupancy: 71, trips: 161 },
    { day: "Thu", occupancy: 74, trips: 158 },
    { day: "Fri", occupancy: 83, trips: 172 },
    { day: "Sat", occupancy: 77, trips: 143 },
    { day: "Sun", occupancy: 49, trips: 96 },
  ],
  occupancyByRoute: routes.map((r, i) => ({
    route: r.code,
    occupancy: [74, 68, 59, 81, 63, 52][i],
    avgJourneyMin: [38, 29, 33, 47, 42, 55][i],
  })),
  bookingTrend: [
    { week: "W1", bookings: 820, revenue: 49200 },
    { week: "W2", bookings: 905, revenue: 54300 },
    { week: "W3", bookings: 1042, revenue: 62520 },
    { week: "W4", bookings: 1187, revenue: 71220 },
    { week: "W5", bookings: 1263, revenue: 75780 },
  ],
  gpsSignalLoss: [
    { day: "Mon", drops: 6 },
    { day: "Tue", drops: 4 },
    { day: "Wed", drops: 9 },
    { day: "Thu", drops: 3 },
    { day: "Fri", drops: 11 },
    { day: "Sat", drops: 7 },
    { day: "Sun", drops: 2 },
  ],
  busesPerDay: [
    { day: "Mon", buses: 11 },
    { day: "Tue", buses: 12 },
    { day: "Wed", buses: 12 },
    { day: "Thu", buses: 12 },
    { day: "Fri", buses: 12 },
    { day: "Sat", buses: 10 },
    { day: "Sun", buses: 8 },
  ],
};
