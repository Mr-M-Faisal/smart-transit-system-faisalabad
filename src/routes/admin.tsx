import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/transit/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Transport Authority Dashboard — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "Fleet monitoring, route and stop management, bookings, condition reports and ridership analytics for transport authorities.",
      },
      { property: "og:title", content: "Transport Authority Dashboard — Smart Transit" },
      {
        property: "og:description",
        content: "Monitor the Faisalabad bus network end to end from one control dashboard.",
      },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/fleet", label: "Fleet & network" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/analytics", label: "Analytics" },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="section py-8">
      <PageHeader
        eyebrow="Control room"
        title="Transport authority dashboard"
        subtitle="Live fleet health, network configuration, revenue and service quality in one place."
      />

      <nav className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
