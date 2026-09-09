import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, TicketCheck, Wallet, XCircle } from "lucide-react";
import { StatCard } from "@/components/transit/primitives";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store/app-store";
import { formatDate, formatPKR } from "@/lib/transit/utils";
import type { Booking } from "@/lib/transit/types";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

const tone: Record<Booking["status"], string> = {
  upcoming: "bg-primary-soft text-primary",
  completed: "bg-success-soft text-success",
  cancelled: "bg-muted text-muted-foreground",
  "no-show": "bg-destructive-soft text-destructive",
};

function AdminBookings() {
  const { bookings } = useStore();
  const paid = bookings.filter((b) => b.status !== "cancelled");
  const revenue = paid.reduce((s, b) => s + b.fare, 0);
  const easypaisa = paid.filter((b) => b.paymentMethod === "easypaisa").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total bookings" value={`${bookings.length}`} icon={TicketCheck} />
        <StatCard
          label="Revenue collected"
          value={formatPKR(revenue)}
          icon={CreditCard}
          tone="success"
        />
        <StatCard
          label="EasyPaisa share"
          value={`${Math.round((easypaisa / Math.max(paid.length, 1)) * 100)}%`}
          hint={`${easypaisa} of ${paid.length} paid bookings`}
          icon={Wallet}
        />
        <StatCard label="Cancelled" value={`${cancelled}`} icon={XCircle} tone="warning" />
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="border-b border-border p-5">
            <h2 className="text-sm font-semibold text-foreground">Bookings & payments</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Fare</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="num font-semibold">{b.id.toUpperCase()}</TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{b.passengerName}</p>
                      <p className="num text-xs text-muted-foreground">{b.passengerPhone}</p>
                    </TableCell>
                    <TableCell className="text-sm">{b.routeName}</TableCell>
                    <TableCell className="num">{b.seats.join(", ")}</TableCell>
                    <TableCell className="num text-xs">{formatDate(b.date)}</TableCell>
                    <TableCell className="num text-xs">
                      {b.paymentMethod === "easypaisa" ? "EasyPaisa" : "JazzCash"}
                      <span className="block text-muted-foreground">{b.paymentRef}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={tone[b.status]}>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="num text-right font-semibold">
                      {formatPKR(b.fare)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
