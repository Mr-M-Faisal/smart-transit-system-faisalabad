import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store/app-store";
import { CITY_CENTER } from "@/lib/transit/mock-data";
import type { Bus, Driver, Route as TRoute, Stop } from "@/lib/transit/types";

export const Route = createFileRoute("/admin/fleet")({
  component: FleetPage,
});

type Editing =
  | { kind: "bus"; value: Bus }
  | { kind: "route"; value: TRoute }
  | { kind: "stop"; value: Stop }
  | { kind: "driver"; value: Driver }
  | null;

const rnd = (p: string) => `${p}-${Math.floor(1000 + Math.random() * 8999)}`;

function FleetPage() {
  const store = useStore();
  const { buses, routes, stops, drivers } = store;
  const [editing, setEditing] = useState<Editing>(null);

  const blankBus = (): Bus => ({
    id: rnd("bus"),
    number: "FSD-0000",
    plate: "FDB-0000",
    routeId: routes[0]?.id ?? "",
    driverId: drivers[0]?.id ?? "",
    capacity: 44,
    occupied: 0,
    speedKmh: 0,
    lat: CITY_CENTER.lat,
    lng: CITY_CENTER.lng,
    bearing: 0,
    progress: 0,
    direction: "outbound",
    status: "idle",
    trustScore: 80,
    punctualityPct: 80,
    onTimeTrips: 0,
    totalTrips: 0,
    gpsAccuracyM: 8,
    lastUpdated: new Date().toISOString(),
    ac: false,
    occupiedSeats: [],
  });

  const blankRoute = (): TRoute => ({
    id: rnd("rt"),
    code: "FR-0",
    name: "New corridor",
    from: "",
    to: "",
    stopIds: stops.slice(0, 4).map((s) => s.id),
    fare: 60,
    distanceKm: 10,
    headwayMin: 15,
    firstBus: "06:00",
    lastBus: "22:00",
    activeBuses: 0,
    color: "#2563eb",
  });

  const blankStop = (): Stop => ({
    id: rnd("st"),
    name: "New stop",
    area: "",
    lat: CITY_CENTER.lat,
    lng: CITY_CENTER.lng,
    shelter: false,
  });

  const blankDriver = (): Driver => ({
    id: rnd("dr"),
    name: "New driver",
    phone: "03XX-XXXXXXX",
    licenseNo: "FSD-DRV-0000",
    busId: null,
    shift: "morning",
    status: "off-shift",
    rating: 4.5,
    experienceYears: 1,
  });

  const save = () => {
    if (!editing) return;
    if (editing.kind === "bus") store.upsertBus(editing.value);
    if (editing.kind === "route") store.upsertRoute(editing.value);
    if (editing.kind === "stop") store.upsertStop(editing.value);
    if (editing.kind === "driver") store.upsertDriver(editing.value);
    setEditing(null);
    toast.success("Saved");
  };

  const field = (key: string, value: string | number, onChange: (v: string) => void) => (
    <div key={key} className="space-y-1.5">
      <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
      <Input value={String(value)} onChange={(e) => onChange(e.target.value)} />
    </div>
  );

  return (
    <div>
      <Tabs defaultValue="buses">
        <TabsList>
          <TabsTrigger value="buses">Buses ({buses.length})</TabsTrigger>
          <TabsTrigger value="routes">Routes ({routes.length})</TabsTrigger>
          <TabsTrigger value="stops">Stops ({stops.length})</TabsTrigger>
          <TabsTrigger value="drivers">Drivers ({drivers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="buses" className="mt-4">
          <Section
            title="Fleet vehicles"
            onAdd={() => setEditing({ kind: "bus", value: blankBus() })}
            head={["Bus", "Plate", "Route", "Capacity", "Status"]}
            rows={buses.map((b) => ({
              id: b.id,
              cells: [
                b.number,
                b.plate,
                routes.find((r) => r.id === b.routeId)?.code ?? "—",
                `${b.capacity}`,
                b.status,
              ],
              onEdit: () => setEditing({ kind: "bus", value: b }),
              onDelete: () => {
                store.removeBus(b.id);
                toast.success("Bus removed");
              },
            }))}
          />
        </TabsContent>

        <TabsContent value="routes" className="mt-4">
          <Section
            title="Routes"
            onAdd={() => setEditing({ kind: "route", value: blankRoute() })}
            head={["Code", "Name", "Fare", "Stops", "Headway"]}
            rows={routes.map((r) => ({
              id: r.id,
              cells: [r.code, r.name, `PKR ${r.fare}`, `${r.stopIds.length}`, `${r.headwayMin} min`],
              onEdit: () => setEditing({ kind: "route", value: r }),
              onDelete: () => {
                store.removeRoute(r.id);
                toast.success("Route removed");
              },
            }))}
          />
        </TabsContent>

        <TabsContent value="stops" className="mt-4">
          <Section
            title="Stops"
            onAdd={() => setEditing({ kind: "stop", value: blankStop() })}
            head={["Name", "Area", "Landmark", "Shelter", "Coordinates"]}
            rows={stops.map((s) => ({
              id: s.id,
              cells: [
                s.name,
                s.area,
                s.landmark ?? "—",
                s.shelter ? "Yes" : "No",
                `${s.lat.toFixed(3)}, ${s.lng.toFixed(3)}`,
              ],
              onEdit: () => setEditing({ kind: "stop", value: s }),
              onDelete: () => {
                store.removeStop(s.id);
                toast.success("Stop removed");
              },
            }))}
          />
        </TabsContent>

        <TabsContent value="drivers" className="mt-4">
          <Section
            title="Drivers"
            onAdd={() => setEditing({ kind: "driver", value: blankDriver() })}
            head={["Name", "Licence", "Shift", "Status", "Rating"]}
            rows={drivers.map((d) => ({
              id: d.id,
              cells: [d.name, d.licenseNo, d.shift, d.status, `★ ${d.rating}`],
              onEdit: () => setEditing({ kind: "driver", value: d }),
              onDelete: () => {
                store.removeDriver(d.id);
                toast.success("Driver removed");
              },
            }))}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="capitalize">Edit {editing?.kind}</DialogTitle>
          </DialogHeader>

          {editing?.kind === "bus" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {field("number", editing.value.number, (v) =>
                setEditing({ kind: "bus", value: { ...editing.value, number: v } }),
              )}
              {field("plate", editing.value.plate, (v) =>
                setEditing({ kind: "bus", value: { ...editing.value, plate: v } }),
              )}
              {field("capacity", editing.value.capacity, (v) =>
                setEditing({ kind: "bus", value: { ...editing.value, capacity: Number(v) || 0 } }),
              )}
              {field("routeId", editing.value.routeId, (v) =>
                setEditing({ kind: "bus", value: { ...editing.value, routeId: v } }),
              )}
            </div>
          )}

          {editing?.kind === "route" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {field("code", editing.value.code, (v) =>
                setEditing({ kind: "route", value: { ...editing.value, code: v } }),
              )}
              {field("name", editing.value.name, (v) =>
                setEditing({ kind: "route", value: { ...editing.value, name: v } }),
              )}
              {field("fare", editing.value.fare, (v) =>
                setEditing({ kind: "route", value: { ...editing.value, fare: Number(v) || 0 } }),
              )}
              {field("headwayMin", editing.value.headwayMin, (v) =>
                setEditing({
                  kind: "route",
                  value: { ...editing.value, headwayMin: Number(v) || 0 },
                }),
              )}
            </div>
          )}

          {editing?.kind === "stop" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {field("name", editing.value.name, (v) =>
                setEditing({ kind: "stop", value: { ...editing.value, name: v } }),
              )}
              {field("area", editing.value.area, (v) =>
                setEditing({ kind: "stop", value: { ...editing.value, area: v } }),
              )}
              {field("lat", editing.value.lat, (v) =>
                setEditing({
                  kind: "stop",
                  value: { ...editing.value, lat: Number(v) || editing.value.lat },
                }),
              )}
              {field("lng", editing.value.lng, (v) =>
                setEditing({
                  kind: "stop",
                  value: { ...editing.value, lng: Number(v) || editing.value.lng },
                }),
              )}
            </div>
          )}

          {editing?.kind === "driver" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {field("name", editing.value.name, (v) =>
                setEditing({ kind: "driver", value: { ...editing.value, name: v } }),
              )}
              {field("phone", editing.value.phone, (v) =>
                setEditing({ kind: "driver", value: { ...editing.value, phone: v } }),
              )}
              {field("licenseNo", editing.value.licenseNo, (v) =>
                setEditing({ kind: "driver", value: { ...editing.value, licenseNo: v } }),
              )}
              {field("experienceYears", editing.value.experienceYears, (v) =>
                setEditing({
                  kind: "driver",
                  value: { ...editing.value, experienceYears: Number(v) || 0 },
                }),
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  title,
  head,
  rows,
  onAdd,
}: {
  title: string;
  head: string[];
  rows: { id: string; cells: string[]; onEdit: () => void; onDelete: () => void }[];
  onAdd: () => void;
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <Button size="sm" onClick={onAdd}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {head.map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  {r.cells.map((c, i) => (
                    <TableCell key={i} className={i === 0 ? "num font-semibold" : "capitalize"}>
                      {c}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={r.onEdit}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" aria-label="Delete" onClick={r.onDelete}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
