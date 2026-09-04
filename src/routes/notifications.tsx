import { createFileRoute } from "@tanstack/react-router";
import {
  BellRing,
  BusFront,
  CheckCheck,
  CreditCard,
  Route as RouteIcon,
  ShieldCheck,
  Ticket,
  TriangleAlert,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/transit/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store/app-store";
import { relativeTime } from "@/lib/transit/utils";
import type { NotificationKind } from "@/lib/transit/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Alerts & Notifications — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "Bus-approaching alerts, route changes, payment receipts, safety updates and travel reminders.",
      },
      { property: "og:title", content: "Alerts & Notifications — Smart Transit" },
      {
        property: "og:description",
        content: "Stay ahead of delays, diversions and boarding times with smart alerts.",
      },
    ],
  }),
  component: NotificationsPage,
});

const icons: Record<NotificationKind, typeof BellRing> = {
  "bus-approaching": BusFront,
  "route-change": RouteIcon,
  booking: Ticket,
  payment: CreditCard,
  reminder: BellRing,
  safety: ShieldCheck,
  "no-show": TriangleAlert,
  service: BellRing,
};

function NotificationsPage() {
  const { notifications, markAllRead, markRead } = useStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="section py-8">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        subtitle={unread ? `${unread} unread alerts` : "You're all caught up."}
        actions={
          <Button variant="outline" onClick={markAllRead} disabled={!unread}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        }
      />

      <div className="mt-6 space-y-3">
        {notifications.length ? (
          notifications.map((n) => {
            const Icon = icons[n.kind] ?? BellRing;
            return (
              <Card
                key={n.id}
                className={cn("border-border transition-colors", !n.read && "border-primary/40 bg-primary-soft/40")}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      <span className="num shrink-0 text-xs text-muted-foreground">
                        {relativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        className="mt-2 text-xs font-semibold text-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon={BellRing}
            title="No notifications"
            description="Alerts about your buses and bookings will appear here."
          />
        )}
      </div>
    </div>
  );
}
