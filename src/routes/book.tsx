import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { QRCodeCanvas } from "qrcode.react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Ticket, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, OccupancyBadge, RouteBadge } from "@/components/transit/primitives";
import { SeatMap } from "@/components/transit/SeatMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store/app-store";
import { transitApi } from "@/lib/api/transit-api";
import { formatPKR } from "@/lib/transit/utils";
import type { Booking } from "@/lib/transit/types";

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>) => ({
    busId: typeof search.busId === "string" ? search.busId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book a Seat — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "Choose your bus, pick an exact seat on the live layout, pay with EasyPaisa or JazzCash and get a QR boarding pass.",
      },
      { property: "og:title", content: "Book a Seat — Smart Transit Faisalabad" },
      {
        property: "og:description",
        content: "Seat-level booking with instant QR tickets for Faisalabad city buses.",
      },
    ],
  }),
  component: BookPage,
});

type Step = "select" | "pay" | "done";

const uid = () => `bk-${Math.floor(100000 + Math.random() * 899999)}`;

function BookPage() {
  const { busId: initialBusId } = Route.useSearch();
  const navigate = useNavigate();
  const { buses, routes, stops, addBooking, session } = useStore();

  const bookableBuses = buses.filter((b) => b.status !== "off-duty");
  const [busId, setBusId] = useState(initialBusId ?? bookableBuses[0]?.id ?? buses[0]?.id ?? "");
  const bus = buses.find((b) => b.id === busId);
  const route = routes.find((r) => r.id === bus?.routeId);
  const routeStopList = useMemo(
    () =>
      (route?.stopIds ?? [])
        .map((id) => stops.find((s) => s.id === id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [route, stops],
  );

  const [seats, setSeats] = useState<string[]>([]);
  const [boarding, setBoarding] = useState("");
  const [destination, setDestination] = useState("");
  const [name, setName] = useState(session?.name ?? "");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"easypaisa" | "jazzcash">("easypaisa");
  const [step, setStep] = useState<Step>("select");
  const [paying, setPaying] = useState(false);
  const [ticket, setTicket] = useState<Booking | null>(null);

  const fare = (route?.fare ?? 0) * Math.max(seats.length, 1);

  const toggleSeat = (seat: string) =>
    setSeats((prev) => (prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]));

  const changeBus = (id: string) => {
    setBusId(id);
    setSeats([]);
    setBoarding("");
    setDestination("");
  };

  const canContinue =
    bus && seats.length > 0 && boarding && destination && boarding !== destination && name.trim() && phone.trim().length >= 10;

  const pay = async () => {
    if (!bus || !route) return;
    setPaying(true);
    try {
      const res = await transitApi.createPaymentIntent(fare, method);
      const boardingStop = routeStopList.find((s) => s.id === boarding);
      const destinationStop = routeStopList.find((s) => s.id === destination);
      const booking: Booking = {
        id: uid(),
        passengerName: name.trim(),
        passengerPhone: phone.trim(),
        busId: bus.id,
        busNumber: bus.number,
        routeId: route.id,
        routeName: route.name,
        boardingStopId: boarding,
        boardingStop: boardingStop?.name ?? "",
        destinationStopId: destination,
        destinationStop: destinationStop?.name ?? "",
        date: new Date().toISOString().slice(0, 10),
        departureTime: new Date(Date.now() + 20 * 60000).toISOString(),
        seats,
        fare,
        status: "upcoming",
        paymentMethod: method,
        paymentRef: res.reference,
        createdAt: new Date().toISOString(),
      };
      addBooking(booking);
      setTicket(booking);
      setStep("done");
      toast.success("Payment successful — your ticket is ready");
    } finally {
      setPaying(false);
    }
  };

  if (step === "done" && ticket) {
    return (
      <div className="section py-10">
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="size-7" />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-foreground">Booking confirmed</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Show this QR pass to the conductor when boarding.
            </p>
          </div>

          <Card className="mt-6 border-border shadow-panel">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Ticket</p>
                  <p className="num text-lg font-bold text-foreground">
                    {ticket.id.toUpperCase()}
                  </p>
                </div>
                <RouteBadge code={ticket.busNumber} />
              </div>

              <div className="grid place-items-center rounded-xl bg-card p-4">
                <QRCodeCanvas value={`SMARTTRANSIT|${ticket.id}|${ticket.busNumber}|${ticket.seats.join(",")}`} size={168} />
              </div>

              <dl className="space-y-2 text-sm">
                <Row k="Passenger" v={ticket.passengerName} />
                <Row k="Route" v={ticket.routeName} />
                <Row k="Boarding" v={ticket.boardingStop} />
                <Row k="Destination" v={ticket.destinationStop} />
                <Row k="Seats" v={ticket.seats.join(", ")} />
                <Row
                  k="Paid via"
                  v={`${ticket.paymentMethod === "easypaisa" ? "EasyPaisa" : "JazzCash"} · ${ticket.paymentRef}`}
                />
                <Separator />
                <Row k="Total" v={formatPKR(ticket.fare)} strong />
              </dl>

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to="/bookings">View my trips</Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setTicket(null);
                    setSeats([]);
                    setStep("select");
                  }}
                >
                  Book another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="section py-8">
      <PageHeader
        eyebrow="Reserve"
        title="Book your seat"
        subtitle="Pick a bus, choose your exact seat and pay with your mobile wallet."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {step === "select" ? (
            <>
              <Card className="border-border">
                <CardContent className="space-y-4 p-5">
                  <div className="space-y-2">
                    <Label>Bus</Label>
                    <Select value={busId} onValueChange={changeBus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a bus" />
                      </SelectTrigger>
                      <SelectContent>
                        {bookableBuses.map((b) => {
                          const r = routes.find((x) => x.id === b.routeId);
                          return (
                            <SelectItem key={b.id} value={b.id}>
                              {b.number} · {r?.code} {r?.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Boarding stop</Label>
                      <Select value={boarding} onValueChange={setBoarding}>
                        <SelectTrigger>
                          <SelectValue placeholder="Where do you board?" />
                        </SelectTrigger>
                        <SelectContent>
                          {routeStopList.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Destination stop</Label>
                      <Select value={destination} onValueChange={setDestination}>
                        <SelectTrigger>
                          <SelectValue placeholder="Where do you get off?" />
                        </SelectTrigger>
                        <SelectContent>
                          {routeStopList.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Passenger name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ayesha Khan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="03XX-XXXXXXX"
                        inputMode="tel"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Choose seats</h2>
                    {bus && <OccupancyBadge bus={bus} />}
                  </div>
                  {bus ? (
                    <SeatMap
                      capacity={bus.capacity}
                      occupiedSeats={bus.occupiedSeats}
                      selected={seats}
                      onToggle={toggleSeat}
                    />
                  ) : null}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-border">
              <CardContent className="space-y-5 p-5">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" /> Back to seats
                </button>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Wallet className="size-4 text-primary" /> Choose payment method
                </h2>
                <RadioGroup
                  value={method}
                  onValueChange={(v) => setMethod(v as "easypaisa" | "jazzcash")}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {[
                    { id: "easypaisa", label: "EasyPaisa", hint: "Mobile wallet · instant" },
                    { id: "jazzcash", label: "JazzCash", hint: "Mobile wallet · instant" },
                  ].map((o) => (
                    <Label
                      key={o.id}
                      htmlFor={o.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
                    >
                      <RadioGroupItem id={o.id} value={o.id} className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-semibold text-foreground">
                          {o.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">{o.hint}</span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
                <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                  Payments run in simulation mode for this prototype — no real charge is made and a
                  reference number is generated for the receipt.
                </p>
                <Button className="w-full" size="lg" disabled={paying} onClick={pay}>
                  {paying ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Processing payment…
                    </>
                  ) : (
                    <>
                      <Ticket className="size-4" /> Pay {formatPKR(fare)}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit border-border lg:sticky lg:top-24">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-sm font-semibold text-foreground">Trip summary</h2>
            <dl className="space-y-2 text-sm">
              <Row k="Bus" v={bus ? `${bus.number} (${bus.plate})` : "—"} />
              <Row k="Route" v={route ? `${route.code} · ${route.name}` : "—"} />
              <Row
                k="From"
                v={routeStopList.find((s) => s.id === boarding)?.name ?? "Not selected"}
              />
              <Row
                k="To"
                v={routeStopList.find((s) => s.id === destination)?.name ?? "Not selected"}
              />
              <Row k="Seats" v={seats.length ? seats.join(", ") : "None"} />
              <Separator />
              <Row k="Fare per seat" v={route ? formatPKR(route.fare) : "—"} />
              <Row k="Total" v={formatPKR(seats.length ? fare : 0)} strong />
            </dl>
            {step === "select" && (
              <Button
                className="w-full"
                disabled={!canContinue}
                onClick={() => setStep("pay")}
              >
                Continue to payment <ArrowRight className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate({ to: "/track" })}
            >
              Find another bus
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd
        className={
          strong
            ? "num text-right text-base font-bold text-foreground"
            : "num text-right font-medium text-foreground"
        }
      >
        {v}
      </dd>
    </div>
  );
}
