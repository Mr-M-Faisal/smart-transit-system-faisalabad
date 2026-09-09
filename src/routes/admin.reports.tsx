import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/transit/primitives";
import { useStore } from "@/lib/store/app-store";
import { relativeTime } from "@/lib/transit/utils";
import type { ConditionReport } from "@/lib/transit/types";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReports,
});

const statusTone: Record<ConditionReport["status"], string> = {
  open: "bg-warning-soft text-warning-foreground",
  "in-review": "bg-primary-soft text-primary",
  resolved: "bg-success-soft text-success",
};

const severityTone: Record<ConditionReport["severity"], string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning-soft text-warning-foreground",
  high: "bg-destructive-soft text-destructive",
};

const flow: ConditionReport["status"][] = ["open", "in-review", "resolved"];

function AdminReports() {
  const { reports, setReportStatus } = useStore();

  if (!reports.length) {
    return (
      <EmptyState
        title="No condition reports"
        description="Commuter reports about bus condition will land here."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {reports.map((r) => (
        <Card key={r.id} className="border-border">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="num text-sm font-bold text-foreground">{r.busNumber}</span>
              <div className="flex gap-2">
                <Badge variant="secondary" className={severityTone[r.severity]}>
                  {r.severity}
                </Badge>
                <Badge variant="secondary" className={statusTone[r.status]}>
                  {r.status}
                </Badge>
              </div>
            </div>
            <p className="text-xs font-semibold capitalize text-primary">
              {r.category.replace("-", " ")}
            </p>
            <p className="text-sm text-muted-foreground">{r.description}</p>
            <p className="num text-xs text-muted-foreground">
              {r.reportedBy} · {relativeTime(r.createdAt)} · {r.id}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {flow
                .filter((s) => s !== r.status)
                .map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReportStatus(r.id, s);
                      toast.success(`Marked ${s}`);
                    }}
                  >
                    Mark {s}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
