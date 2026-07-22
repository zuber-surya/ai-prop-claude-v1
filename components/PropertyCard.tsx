import Image from "next/image";
import Link from "next/link";
import type { PropertyListItem } from "@/lib/properties";
import { formatInrPaise } from "@/lib/format";
import { AreaIcon, BathIcon, BedIcon, LocationIcon } from "@/components/icons";

export function PropertyCard({
  property,
}: {
  property: PropertyListItem & { bathrooms?: number; area?: number };
}) {
  return (
    <Link
      href={`/property/${property.id}`}
      className="group block w-full overflow-hidden rounded-md border border-outline-variant bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-56 w-full bg-surface-container">
        {property.thumbnailUrl ? (
          <Image
            src={property.thumbnailUrl}
            alt={property.title}
            fill
            sizes="(min-width: 768px) 320px, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="p-6">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold text-on-surface">
            {property.title}
          </h3>
          <span className="whitespace-nowrap font-bold text-primary">
            {formatInrPaise(property.price)}
          </span>
        </div>
        <p className="mb-4 flex items-center gap-1 text-sm text-on-surface-variant">
          <LocationIcon className="size-4" />
          {property.location}
        </p>
        <div className="flex items-center gap-4 border-t border-outline-variant pt-4 text-sm text-on-surface-variant">
          <span className="flex items-center gap-1">
            <BedIcon className="size-[18px]" />
            {property.bedrooms} BHK
          </span>
          {property.bathrooms != null ? (
            <span className="flex items-center gap-1">
              <BathIcon className="size-[18px]" />
              {property.bathrooms} Bath
            </span>
          ) : null}
          {property.area != null ? (
            <span className="flex items-center gap-1">
              <AreaIcon className="size-[18px]" />
              {property.area.toLocaleString("en-IN")} sq.ft
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
