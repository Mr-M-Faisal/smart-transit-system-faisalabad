export type LatLng = { lat: number; lng: number };

export type Stop = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  landmark?: string;
  shelter: boolean;
};

export type Route = {
  id: string;
  code: string;
  name: string;
  from: string;
  to: string;
  stopIds: string[];
  fare: number;
  distanceKm: number;
  headwayMin: number;
  firstBus: string;
  lastBus: string;
  activeBuses: number;
  color: string;
};

export type SeatState = "available" | "occupied" | "selected" | "disabled";

export type OccupancyLevel = "available" | "limited" | "full";

export type Bus = {
  id: string;
  number: string;
  plate: string;
  routeId: string;
  driverId: string;
  capacity: number;
  occupied: number;
  speedKmh: number;
  lat: number;
  lng: number;
  bearing: number;
  progress: number; // 0..1 along route path
  direction: "outbound" | "inbound";
  status: "on-trip" | "idle" | "off-duty" | "delayed";
  trustScore: number;
  punctualityPct: number;
  onTimeTrips: number;
  totalTrips: number;
  gpsAccuracyM: number;
  lastUpdated: string;
  ac: boolean;
  occupiedSeats: string[];
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  licenseNo: string;
  busId: string | null;
  shift: "morning" | "evening" | "night";
  status: "on-shift" | "off-shift" | "break";
  rating: number;
  experienceYears: number;
};

export type BookingStatus = "upcoming" | "completed" | "cancelled" | "no-show";

export type Booking = {
  id: string;
  passengerName: string;
  passengerPhone: string;
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  boardingStopId: string;
  boardingStop: string;
  destinationStopId: string;
  destinationStop: string;
  date: string;
  departureTime: string;
  seats: string[];
  fare: number;
  status: BookingStatus;
  paymentMethod: "easypaisa" | "jazzcash";
  paymentRef: string;
  createdAt: string;
};

export type ConditionReport = {
  id: string;
  busId: string;
  busNumber: string;
  category: "damaged-seat" | "cleanliness" | "air-conditioning" | "lighting" | "other";
  description: string;
  reportedBy: string;
  createdAt: string;
  status: "open" | "in-review" | "resolved";
  severity: "low" | "medium" | "high";
};

export type NotificationKind =
  | "bus-approaching"
  | "route-change"
  | "booking"
  | "payment"
  | "reminder"
  | "safety"
  | "no-show"
  | "service";

export type TransitNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type SafetySession = {
  id: string;
  busId: string;
  busNumber: string;
  routeName: string;
  contacts: string[];
  startedAt: string;
  link: string;
};

export type Role = "commuter" | "driver" | "admin";

export type Session = {
  role: Role;
  name: string;
  identifier: string;
};
