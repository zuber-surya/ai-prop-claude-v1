import Link from "next/link";
import { listPublishedProperties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";
import { SearchFilters } from "@/components/SearchFilters";
import { PropertyMapLoader as PropertyMap } from "@/components/PropertyMapLoader";

type View = "grid" | "list" | "map";

// Same "fresh results, not a frozen build-time snapshot" reasoning as the
// landing page (app/page.tsx) - search results must reflect current
// filters/data, never a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const get = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const q = get("q");
  const type = get("type");
  const bedroomsRaw = get("bedrooms");
  const sort = get("sort");
  const view: View =
    get("view") === "list" ? "list" : get("view") === "map" ? "map" : "grid";
  const page = Number(get("page")) || 1;

  // The form's price inputs are in rupees (user-facing); the shared query
  // layer and API_CONTRACT.md's GET /api/properties both work in paise
  // (SCHEMA.md §3). Converting here keeps this page's own URL friendly
  // without changing the public API's documented units.
  const minPriceRupees = get("minPrice");
  const maxPriceRupees = get("maxPrice");

  const result = await listPublishedProperties({
    q,
    type,
    bedrooms: bedroomsRaw ? Number(bedroomsRaw) : null,
    minPrice: minPriceRupees ? Number(minPriceRupees) * 100 : null,
    maxPrice: maxPriceRupees ? Number(maxPriceRupees) * 100 : null,
    sort,
    page,
    // The map needs every geocoded result at once to plot pins sensibly,
    // not just one page of 20 - use a larger page size for map view.
    pageSize: view === "map" ? 100 : undefined,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (type) baseParams.set("type", type);
  if (bedroomsRaw) baseParams.set("bedrooms", bedroomsRaw);
  if (minPriceRupees) baseParams.set("minPrice", minPriceRupees);
  if (maxPriceRupees) baseParams.set("maxPrice", maxPriceRupees);
  if (sort) baseParams.set("sort", sort);

  function viewHref(v: View) {
    const p = new URLSearchParams(baseParams);
    if (v !== "grid") p.set("view", v);
    return `/search?${p.toString()}`;
  }

  function pageHref(n: number) {
    const p = new URLSearchParams(baseParams);
    if (view !== "grid") p.set("view", view);
    if (n > 1) p.set("page", String(n));
    return `/search?${p.toString()}`;
  }

  return (
    <>
      <header className="border-b border-outline-variant bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 md:px-10">
          <Link href="/" className="text-xl font-bold text-on-surface">
            Property Website
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-on-surface transition-colors hover:text-primary"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-10">
        <h1 className="mb-4 text-2xl font-bold text-on-surface">
          {q ? `Properties in ${q}` : "All properties"}
        </h1>

        <div className="mb-6">
          <SearchFilters
            defaultValues={{
              q,
              type,
              bedrooms: bedroomsRaw,
              minPrice: minPriceRupees,
              maxPrice: maxPriceRupees,
              sort,
            }}
          />
        </div>

        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant">
            {result.total} {result.total === 1 ? "property" : "properties"} found
          </p>
          <div className="flex gap-1 rounded-md bg-surface-container-high p-1">
            <ViewButton href={viewHref("grid")} active={view === "grid"}>
              Grid
            </ViewButton>
            <ViewButton href={viewHref("list")} active={view === "list"}>
              List
            </ViewButton>
            <ViewButton href={viewHref("map")} active={view === "map"}>
              Map
            </ViewButton>
          </div>
        </div>

        {result.results.length === 0 ? (
          <EmptyState />
        ) : view === "map" ? (
          <PropertyMap properties={result.results} />
        ) : (
          <div
            className={
              view === "list"
                ? "flex flex-col gap-4"
                : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {result.results.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        {view !== "map" && totalPages > 1 ? (
          <nav className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={pageHref(n)}
                className={
                  n === page
                    ? "flex size-10 items-center justify-center rounded-md bg-primary font-semibold text-on-primary"
                    : "flex size-10 items-center justify-center rounded-md text-sm text-on-surface-variant hover:bg-surface-container-high"
                }
              >
                {n}
              </Link>
            ))}
          </nav>
        ) : null}
      </main>
    </>
  );
}

function ViewButton({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-primary shadow-sm"
          : "rounded px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface"
      }
    >
      {children}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
      <h2 className="text-xl font-bold text-on-surface">
        No properties match your filters
      </h2>
      <p className="max-w-md text-on-surface-variant">
        Try removing a filter, widening your price range, or searching a
        different location.
      </p>
      <Link
        href="/search"
        className="mt-2 font-semibold text-primary hover:underline"
      >
        Clear all filters
      </Link>
    </div>
  );
}
