import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BusFront,
  CalendarCheck,
  Gauge,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPinned,
  Menu,
  Route as RouteIcon,
  ShieldCheck,
  Ticket,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/app-store";

type NavItem = { to: string; label: string; icon: typeof BusFront };

const commuterNav: NavItem[] = [
  { to: "/track", label: "Live map", icon: MapPinned },
  { to: "/routes", label: "Routes", icon: RouteIcon },
  { to: "/book", label: "Book seat", icon: Ticket },
  { to: "/bookings", label: "My trips", icon: CalendarCheck },
  { to: "/safety", label: "Safety", icon: ShieldCheck },
  { to: "/report", label: "Report", icon: TriangleAlert },
];

const roleNav: NavItem[] = [
  { to: "/driver", label: "Driver", icon: Gauge },
  { to: "/admin", label: "Admin", icon: LayoutDashboard },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-card">
        <BusFront className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight text-foreground">
          Smart Transit
        </span>
        <span className="block text-[11px] text-muted-foreground">Faisalabad</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { notifications, session, logout, liveEnabled } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => !n.read).length;

  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const items = [...commuterNav, ...roleNav];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
        <div className="section flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <Brand />
            <nav className="hidden items-center gap-0.5 lg:flex">
              {items.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(to)
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success sm:inline-flex">
              <span
                className={cn(
                  "size-1.5 rounded-full bg-success",
                  liveEnabled && "animate-pulse",
                )}
              />
              {liveEnabled ? "Live GPS" : "Paused"}
            </span>

            <Link
              to="/notifications"
              className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-[18px]" />
              {unread > 0 ? (
                <span className="num absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              ) : null}
            </Link>

            {session ? (
              <div className="hidden items-center gap-2 sm:flex">
                <div className="text-right leading-tight">
                  <p className="text-xs font-semibold text-foreground">{session.name}</p>
                  <p className="text-[11px] capitalize text-muted-foreground">{session.role}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
                  <LogOut className="size-[18px]" />
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">
                  <LogIn className="size-4" />
                  Sign in
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-border bg-surface lg:hidden">
            <nav className="section grid grid-cols-2 gap-1 py-3">
              {items.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive(to)
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
              {!session ? (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  <LogIn className="size-4" /> Sign in
                </Link>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-foreground"
                >
                  <LogOut className="size-4" /> Sign out ({session.name})
                </button>
              )}
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1 pb-20 lg:pb-0">{children}</main>

      <footer className="hidden border-t border-border bg-surface lg:block">
        <div className="section flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <p className="text-xs text-muted-foreground">
            Real-time bus tracking &amp; seat booking for Faisalabad · Demo data, backend-ready API
            layer.
          </p>
        </div>
      </footer>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-border bg-surface/95 backdrop-blur-md lg:hidden">
        {commuterNav.slice(0, 5).map(
          ({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive(to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-[18px]" />
              {label}
            </Link>
          ),
        )}
      </nav>
    </div>
  );
}
