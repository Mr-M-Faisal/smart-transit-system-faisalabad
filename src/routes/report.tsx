import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/transit/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store/app-store";
import { relativeTime } from "@/lib/transit/utils";
import type { ConditionReport } from "@/lib/transit/types";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Bus Issue — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "Report damaged seats, cleanliness, air-conditioning or lighting problems on any Faisalabad city bus.",
      },
      { property: "og:title", content: "Report a Bus Issue — Smart Transit" },
      {
        property: "og:description",
        content: "Help keep the fleet in shape by reporting bus condition issues in seconds.",
      },
    ],
  }),
  component: ReportPage,
});

const categories: { value: ConditionReport["category"]; label: string }[] = [
  { value: "damaged-seat", label: "Damaged seat" },
  { value: "cleanliness", label: "Cleanliness" },
  { value: "air-conditioning", label: "Air conditioning" },
  { value: "lighting", label: "Lighting" },
  { value: "other", label: "Other" },
];

const statusTone: Record<ConditionReport["status"], string> = {
  open: "bg-warning-soft text-warning-foreground",
  "in-review": "bg-primary-soft text-primary",
  resolved: "bg-success-soft text-success",
};

function ReportPage() {
  const { buses, reports, addReport, pushNotification, session } = useStore();
  const [busId, setBusId] = useState(buses[0]?.id ?? "");
  const [category, setCategory] = useState<ConditionReport["category"]>("damaged-seat");
  const [severity, setSeverity] = useState<ConditionReport["severity"]>("medium");
  const [description, setDescription] = useState("");
  const [reporter, setReporter] = useState(session?.name ?? "");

  const submit = () => {
    const bus = buses.find((b) => b.id === busId);
    if (!bus || description.trim().length < 10) {
      toast.error("Pick a bus and describe the issue (10+ characters)");
      return;
    }
    addReport({
      id: `cr-${Math.floor(10000 + Math.random() * 89999)}`,
      busId: bus.id,
      busNumber: bus.number,
      category,
      description: description.trim(),
      reportedBy: reporter.trim() || "Anonymous commuter",
      createdAt: new Date().toISOString(),
      status: "open",
      severity,
    });
    pushNotification({
      kind: "service",
      title: "Report submitted",
      body: `Your ${category.replace("-", " ")} report for ${bus.number} was sent to the maintenance team.`,
    });
    setDescription("");
    toast.success("Thanks — the maintenance team has been notified");
  };

  return (
    <div className="section py-8">
      <PageHeader
        eyebrow="Feedback"
        title="Report a bus condition issue"
        subtitle="Broken seats, dirty cabins or a failing AC — tell us and the maintenance team is alerted instantly."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_400px]">
        <Card className="border-border">
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bus</Label>
                <Select value={busId} onValueChange={setBusId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.number} · {b.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Issue type</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as ConditionReport["category"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={severity}
                  onValueChange={(v) => setSeverity(v as ConditionReport["severity"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reporter">Your name (optional)</Label>
                <Input
                  id="reporter"
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  placeholder="Anonymous commuter"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">What's wrong?</Label>
              <Textarea
                id="desc"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Seat 4B is broken and the cushion is torn…"
              />
            </div>

            <Button onClick={submit}>
              <TriangleAlert className="size-4" /> Submit report
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Recent reports</h2>
            <ul className="mt-3 space-y-3">
              {reports.slice(0, 8).map((r) => (
                <li key={r.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="num text-sm font-semibold text-foreground">{r.busNumber}</span>
                    <Badge variant="secondary" className={statusTone[r.status]}>
                      {r.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs capitalize text-primary">
                    {r.category.replace("-", " ")} · {r.severity}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                  <p className="num mt-1 text-xs text-muted-foreground">
                    {r.reportedBy} · {relativeTime(r.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
