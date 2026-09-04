import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, PhoneCall, ShieldCheck, Siren, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/transit/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/app-store";
import { relativeTime } from "@/lib/transit/utils";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Journey Safety Sharing — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "Share a live trip link with family, keep emergency contacts handy and raise an SOS alert while travelling.",
      },
      { property: "og:title", content: "Journey Safety Sharing — Smart Transit" },
      {
        property: "og:description",
        content: "Live trip sharing and emergency alerts for safer commutes in Faisalabad.",
      },
    ],
  }),
  component: SafetyPage,
});

const helplines = [
  { label: "Police emergency", number: "15" },
  { label: "Rescue 1122", number: "1122" },
  { label: "Transport control room", number: "041-9200500" },
];

function SafetyPage() {
  const { buses, routes, safety, startSafety, stopSafety, pushNotification } = useStore();
  const onTrip = buses.filter((b) => b.status !== "off-duty");
  const [busId, setBusId] = useState(onTrip[0]?.id ?? "");
  const [contact1, setContact1] = useState("");
  const [contact2, setContact2] = useState("");

  const bus = buses.find((b) => b.id === busId);
  const route = routes.find((r) => r.id === bus?.routeId);

  const start = () => {
    if (!bus) return;
    const contacts = [contact1, contact2].map((c) => c.trim()).filter(Boolean);
    if (!contacts.length) {
      toast.error("Add at least one emergency contact");
      return;
    }
    startSafety({
      busId: bus.id,
      busNumber: bus.number,
      routeName: route?.name ?? "",
      contacts,
    });
    pushNotification({
      kind: "safety",
      title: "Trip sharing started",
      body: `Live location on ${bus.number} is being shared with ${contacts.length} contact(s).`,
    });
    toast.success("Live trip sharing is on");
  };

  const sos = () => {
    pushNotification({
      kind: "safety",
      title: "SOS alert sent",
      body: "Emergency alert dispatched to your contacts and the transport control room.",
    });
    toast.error("SOS alert sent to your contacts and control room");
  };

  return (
    <div className="section py-8">
      <PageHeader
        eyebrow="Safety"
        title="Travel safety"
        subtitle="Share your live journey, keep helplines one tap away and raise an alert if something feels wrong."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="border-border">
          <CardContent className="space-y-5 p-5">
            {safety ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-success-soft text-success" variant="secondary">
                    <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-success" />
                    Sharing live
                  </Badge>
                  <span className="num text-xs text-muted-foreground">
                    started {relativeTime(safety.startedAt)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trip</p>
                  <p className="text-base font-semibold text-foreground">
                    {safety.busNumber} · {safety.routeName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shared with</p>
                  <p className="num text-sm font-medium text-foreground">
                    {safety.contacts.join(", ")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Live tracking link</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={safety.link} className="num" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        void navigator.clipboard?.writeText(safety.link);
                        toast.success("Link copied");
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    stopSafety();
                    toast.success("Trip sharing stopped");
                  }}
                >
                  <StopCircle className="size-4" /> Stop sharing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="size-4 text-primary" /> Start live trip sharing
                </h2>
                <div className="space-y-2">
                  <Label>Which bus are you on?</Label>
                  <Select value={busId} onValueChange={setBusId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {onTrip.map((b) => {
                        const r = routes.find((x) => x.id === b.routeId);
                        return (
                          <SelectItem key={b.id} value={b.id}>
                            {b.number} · {r?.code}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="c1">Emergency contact 1</Label>
                    <Input
                      id="c1"
                      value={contact1}
                      onChange={(e) => setContact1(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      inputMode="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c2">Emergency contact 2 (optional)</Label>
                    <Input
                      id="c2"
                      value={contact2}
                      onChange={(e) => setContact2(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      inputMode="tel"
                    />
                  </div>
                </div>
                <Button onClick={start} disabled={!bus}>
                  <ShieldCheck className="size-4" /> Start sharing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-destructive/40 bg-destructive-soft">
            <CardContent className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <Siren className="size-4" /> Emergency SOS
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Instantly notifies your contacts and the control room with your bus number and last
                known location.
              </p>
              <Button variant="destructive" className="mt-4 w-full" onClick={sos}>
                Send SOS alert
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Helplines</h2>
              <ul className="mt-3 space-y-2">
                {helplines.map((h) => (
                  <li key={h.number} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground">{h.label}</span>
                    <a
                      href={`tel:${h.number}`}
                      className="num inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      <PhoneCall className="size-3.5" /> {h.number}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
