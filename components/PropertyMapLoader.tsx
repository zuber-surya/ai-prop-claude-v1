"use client";

import dynamic from "next/dynamic";
import type { PropertyListItem } from "@/lib/properties";

// `ssr: false` dynamic imports aren't allowed directly inside a Server
// Component (Next.js build error) - this Client Component boundary is what
// makes it valid. Leaflet needs `window`, so the map can't render server-side
// regardless.
const PropertyMap = dynamic(
  () => import("@/components/PropertyMap").then((m) => m.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-md border border-outline-variant text-on-surface-variant">
        Loading map…
      </div>
    ),
  }
);

export function PropertyMapLoader({
  properties,
}: {
  properties: PropertyListItem[];
}) {
  return <PropertyMap properties={properties} />;
}
