import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { QRCodeCanvas } from "qrcode.react";
import { CalendarCheck, MapPin, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/transit/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/app-store";
import { formatDate, formatPKR, formatTime } from "@/lib/transit/utils";
import type { Booking } from "@/lib/transit/types";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My Trips & Tickets — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "View upcoming and past bus trips, open QR boarding passes and cancel bookings you no longer need.",
      },
      { property: "og:title", content: "My Trips & Tickets — Smart Transit" },
      {
        property: "og:description",
        content: "All your Faisalabad bus bookings, tickets and payment receipts in one place.",
      },
    ],
  }),
  component: BookingsPage,
});

const tone: Record<Booking["status"], string> = {
  upcoming: "bg-primary-soft text-primary",
  completed: "bg-success-soft text-success",
  cancelled: "bg-muted text-muted-foreground",
  "no-show": "bg-destructive-soft text-destructive",
};

function BookingsPage() {
  const { bookings, cancelBooking } = useStore();
  const [open, setOpen] = useState<Booking | null>(null);

  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const history = bookings.filter((b) => b.status !== "upcoming");

  return (
    <div className="section py-8">
      <PageHeader
        eyebrow="Tickets"
        title="My trips"
        subtitle="Boarding passes, payment receipts and your full travel history."
        actions={
          <Button asChild>
            <Link to="/book">
              <Ticket className="size-4" /> New booking
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="upcoming" className="mt-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length ? (
            upcoming.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                onTicket={() => setOpen(b)}
                onCancel={() => {
                  cancelBooking(b.id);
                  toast.success("Booking cancelled");
                }}
              />
            ))
          ) : (
            <EmptyState
              icon={CalendarCheck}
              title="No upcoming trips"
              description="Book a seat and your boarding pass will show up here."
              action={
                <Button asChild>
                  <Link to="/book">Book a seat</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {history.length ? (
            history.map((b) => (
              <BookingRow key={b.id} booking={b} onTicket={() => setOpen(b)} />
            ))
          ) : (
            <EmptyState title="No past trips yet" description="Completed trips appear here." />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(open)} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Boarding pass</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="space-y-4">
              <div className="grid place-items-center rounded-xl bg-muted p-4">
                <QRCodeCanvas
                  value={`SMARTTRANSIT|${open.id}|${open.busNumber}|${open.seats.join(",")}`}
                  size={168}
                />
              </div>
              <dl className="space-y-1.5 text-sm">
                <Line k="Ticket" v={open.id.toUpperCase()} />
                <Line k="Bus" v={open.busNumber} />
                <Line k="Seats" v={open.seats.join(", ")} />
                <Line k="From" v={open.boardingStop} />
                <Line k="To" v={open.destinationStop} />
                <Line k="Fare" v={formatPKR(open.fare)} />
                <Line k="Reference" v={open.paymentRef} />
              </dl>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="num font-medium text-foreground">{v}</dd>
    </div>
  );
}

function BookingRow({
  booking,
  onTicket,
  onCancel,
}: {
  booking: Booking;
  onTicket: () => void;
  onCancel?: () => void;
}) {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-52 space-y-1">
          <div className="flex items-center gap-2">
            <span className="num text-sm font-bold text-foreground">{booking.busNumber}</span>
            <Badge className={tone[booking.status]} variant="secondary">
              {booking.status}
            </Badge>
          </div>
          <p className="text-sm text-foreground">{booking.routeName}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> {booking.boardingStop} → {booking.destinationStop}
          </p>
        </div>

        <div className="num space-y-1 text-xs text-muted-foreground">
          <p>{formatDate(booking.date)} · {formatTime(booking.departureTime)}</p>
          <p>Seats {booking.seats.join(", ")}</p>
          <p className="font-semibold text-foreground">{formatPKR(booking.fare)}</p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onTicket}>
            <Ticket className="size-4" /> Ticket
          </Button>
          {onCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <X className="size-4" /> Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
