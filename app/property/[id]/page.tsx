import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProperty, listPublishedProperties } from "@/lib/properties";
import { formatInrPaise } from "@/lib/format";
import { PhotoGallery } from "@/components/PhotoGallery";
import { EmiCalculator } from "@/components/EmiCalculator";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyMapLoader as PropertyMap } from "@/components/PropertyMapLoader";
import { AreaIcon, BathIcon, BedIcon, LocationIcon } from "@/components/icons";
import ChatWidget from "@/components/ChatWidget";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getPublishedProperty(id);
  if (!property) return { title: "Property not found" };
  return {
    title: `${property.title} | Property Website`,
    description: property.description.slice(0, 160),
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPublishedProperty(id);

  if (!property) {
    notFound();
  }

  const similar = await listPublishedProperties({
    type: property.type,
    pageSize: 4,
  });
  const similarProperties = similar.results
    .filter((p) => p.id !== property.id)
    .slice(0, 3);

  return (
    <>
      <header className="border-b border-outline-variant bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 md:px-10">
          <Link href="/" className="text-xl font-bold text-on-surface">
            Property Website
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/search"
              className="text-sm text-on-surface-variant transition-colors hover:text-primary"
            >
              Browse listings
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-on-surface transition-colors hover:text-primary"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-10">
        <PhotoGallery photos={property.photos} title={property.title} />

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-10 lg:col-span-2">
            <section>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-on-surface text-balance">
                    {property.title}
                  </h1>
                  <p className="mt-1 flex items-center gap-1 text-on-surface-variant">
                    <LocationIcon className="size-4" />
                    {property.location}
                  </p>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {formatInrPaise(property.price)}
                </div>
              </div>

              <div className="flex gap-8 rounded-lg border border-outline-variant bg-surface-container-low p-6">
                <SpecItem icon={<BedIcon className="size-5" />} value={property.bedrooms} label="Bedrooms" />
                <div className="w-px self-stretch bg-outline-variant" />
                <SpecItem icon={<BathIcon className="size-5" />} value={property.bathrooms} label="Bathrooms" />
                <div className="w-px self-stretch bg-outline-variant" />
                <SpecItem
                  icon={<AreaIcon className="size-5" />}
                  value={property.area.toLocaleString("en-IN")}
                  label="Sq Ft"
                />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-on-surface">
                Description
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-on-surface-variant">
                {property.description}
              </p>
            </section>

            {property.amenities.length > 0 ? (
              <section>
                <h2 className="mb-3 text-xl font-bold text-on-surface">
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-3">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-md border border-outline-variant bg-surface-container-highest px-4 py-2 text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h2 className="mb-3 text-xl font-bold text-on-surface">
                Floor plan
              </h2>
              <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low text-center">
                <p className="text-on-surface-variant">
                  Floor plan not available for this listing.
                </p>
              </div>
            </section>

            {property.latitude != null && property.longitude != null ? (
              <section>
                <h2 className="mb-3 text-xl font-bold text-on-surface">
                  Location
                </h2>
                <PropertyMap
                  properties={[
                    {
                      id: property.id,
                      title: property.title,
                      price: property.price,
                      bedrooms: property.bedrooms,
                      type: property.type,
                      location: property.location,
                      latitude: property.latitude,
                      longitude: property.longitude,
                      thumbnailUrl: property.photos[0] ?? null,
                      createdAt: property.createdAt.toISOString(),
                    },
                  ]}
                />
              </section>
            ) : null}

            <EmiCalculator propertyPricePaise={property.price} />
          </div>

          {similarProperties.length > 0 ? (
            <aside className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
                Similar properties
              </h2>
              {similarProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </aside>
          ) : null}
        </div>
      </main>

      <ChatWidget />
    </>
  );
}

function SpecItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-md bg-primary-container/10 p-2 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold leading-tight text-on-surface">
          {value}
        </div>
        <div className="text-xs uppercase tracking-wider text-on-surface-variant">
          {label}
        </div>
      </div>
    </div>
  );
}
