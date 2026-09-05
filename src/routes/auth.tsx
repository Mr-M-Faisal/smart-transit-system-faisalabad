import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BusFront, Gauge, LayoutDashboard, LogIn, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/lib/store/app-store";
import type { Role } from "@/lib/transit/types";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Smart Transit Faisalabad" },
      {
        name: "description",
        content:
          "Sign in as a commuter, bus driver or transport authority to manage trips, shifts and the fleet.",
      },
      { property: "og:title", content: "Sign In — Smart Transit Faisalabad" },
      {
        property: "og:description",
        content: "Three roles, one platform: commuters, drivers and transport authorities.",
      },
    ],
  }),
  component: AuthPage,
});

const roleMeta: Record<Role, { label: string; icon: typeof User; hint: string; to: string }> = {
  commuter: {
    label: "Commuter",
    icon: User,
    hint: "Track buses, book seats and manage your trips.",
    to: "/track",
  },
  driver: {
    label: "Driver",
    icon: Gauge,
    hint: "Broadcast GPS, manage shifts and update occupancy.",
    to: "/driver",
  },
  admin: {
    label: "Authority",
    icon: LayoutDashboard,
    hint: "Monitor the fleet, routes, bookings and analytics.",
    to: "/admin",
  },
};

function AuthPage() {
  const navigate = useNavigate();
  const { login } = useStore();
  const [role, setRole] = useState<Role>("commuter");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");

  const meta = roleMeta[role];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      role,
      name: name.trim() || meta.label,
      identifier: identifier.trim() || "demo@smarttransit.pk",
    });
    toast.success(`Signed in as ${meta.label.toLowerCase()}`);
    navigate({ to: meta.to });
  };

  return (
    <div className="section flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <BusFront className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Welcome to Smart Transit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your role to continue. Commuters can browse live buses without signing in.
          </p>
        </div>

        <Card className="mt-6 border-border shadow-panel">
          <CardContent className="p-6">
            <Tabs value={role} onValueChange={(v) => setRole(v as Role)}>
              <TabsList className="grid w-full grid-cols-3">
                {(Object.keys(roleMeta) as Role[]).map((r) => (
                  <TabsTrigger key={r} value={r}>
                    {roleMeta[r].label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {(Object.keys(roleMeta) as Role[]).map((r) => (
                <TabsContent key={r} value={r} className="mt-3">
                  <p className="text-xs text-muted-foreground">{roleMeta[r].hint}</p>
                </TabsContent>
              ))}
            </Tabs>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bilal Ahmed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {role === "driver" ? "Driver ID or licence number" : "Mobile number or email"}
                </Label>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === "driver" ? "FSD-DRV-1042" : "03XX-XXXXXXX"}
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                <LogIn className="size-4" /> Continue as {meta.label.toLowerCase()}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Demo sign-in — no password required in this prototype. Real JWT authentication is
              handled by the backend service later.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
