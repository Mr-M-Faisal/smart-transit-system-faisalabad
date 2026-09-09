import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { analytics } from "@/lib/transit/mock-data";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

const config = {
  occupancy: { label: "Occupancy %", color: "var(--chart-1)" },
  trips: { label: "Trips", color: "var(--chart-2)" },
  bookings: { label: "Bookings", color: "var(--chart-1)" },
  revenue: { label: "Revenue (PKR)", color: "var(--chart-3)" },
  drops: { label: "GPS signal drops", color: "var(--chart-4)" },
  buses: { label: "Buses on road", color: "var(--chart-2)" },
} satisfies ChartConfig;

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mb-4 text-xs text-muted-foreground">{subtitle}</p>
        <ChartContainer config={config} className="h-[240px] w-full">
          {children as React.ReactElement}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function AdminAnalytics() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="Weekly occupancy" subtitle="Average seat utilisation per day of week">
        <AreaChart data={analytics.occupancyByDay}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="occupancy"
            type="monotone"
            stroke="var(--color-occupancy)"
            fill="var(--color-occupancy)"
            fillOpacity={0.18}
            strokeWidth={2}
          />
        </AreaChart>
      </Panel>

      <Panel title="Occupancy by route" subtitle="Which corridors carry the heaviest load">
        <BarChart data={analytics.occupancyByRoute}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="route" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="occupancy" fill="var(--color-occupancy)" radius={6} />
        </BarChart>
      </Panel>

      <Panel title="Booking & revenue trend" subtitle="Last five weeks of ticket sales">
        <LineChart data={analytics.bookingTrend}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="week" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={44} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="bookings"
            type="monotone"
            stroke="var(--color-bookings)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="revenue"
            type="monotone"
            stroke="var(--color-revenue)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </Panel>

      <Panel title="GPS reliability" subtitle="Signal drops recorded across the fleet">
        <BarChart data={analytics.gpsSignalLoss}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="drops" fill="var(--color-drops)" radius={6} />
        </BarChart>
      </Panel>

      <Panel title="Buses on road" subtitle="Daily active vehicles vs. fleet size">
        <BarChart data={analytics.busesPerDay}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="buses" fill="var(--color-buses)" radius={6} />
        </BarChart>
      </Panel>

      <Panel title="Trips per day" subtitle="Completed trips across all routes">
        <LineChart data={analytics.occupancyByDay}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={36} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="trips"
            type="monotone"
            stroke="var(--color-trips)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </Panel>
    </div>
  );
}
