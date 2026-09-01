import { Suspense, lazy } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeafletMapProps } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <div className="w-full space-y-3 p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-full min-h-40 w-full" />
        <p className="text-center text-xs text-muted-foreground">Loading live map…</p>
      </div>
    </div>
  );
}

/** SSR-safe wrapper — Leaflet only loads in the browser. */
export function TransitMap(props: LeafletMapProps) {
  const hydrated = useHydrated();
  if (!hydrated) return <MapSkeleton />;
  return (
    <Suspense fallback={<MapSkeleton />}>
      <LeafletMap {...props} />
    </Suspense>
  );
}
