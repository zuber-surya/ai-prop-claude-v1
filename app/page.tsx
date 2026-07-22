import Link from "next/link";
import { listPublishedProperties } from "@/lib/properties";
import { PropertyCard } from "@/components/PropertyCard";
import { ArrowRightIcon, SearchIcon } from "@/components/icons";

// Without this, Next.js prerenders the page (and its "featured" query)
// once at build time, since nothing here uses a request-time API. That
// would freeze "recently published" listings until the next rebuild.
export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await listPublishedProperties({
    sort: "date_desc",
    pageSize: 6,
  });

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 md:px-10">
          <Link href="/" className="text-xl font-bold text-on-surface">
            Property Website
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/search"
              className="hidden text-sm text-on-surface-variant transition-colors hover:text-primary md:inline"
            >
              Browse listings
            </Link>
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

      <main className="flex-1">
        <section className="flex flex-col items-center px-4 py-10 text-center">
          <div className="w-full max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-on-surface text-balance md:text-5xl">
              Find your next home
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-on-surface-variant">
              Browse listings by location, price, and size - no account
              needed.
            </p>

            <form
              action="/search"
              method="GET"
              className="mx-auto mt-10 flex w-full items-center rounded-lg border-2 border-primary bg-surface-container-lowest p-1 shadow-md focus-within:ring-4 focus-within:ring-primary/10"
            >
              <SearchIcon className="ml-4 size-5 shrink-0 text-on-surface-variant" />
              <input
                type="text"
                name="q"
                placeholder="Search by neighborhood or city, e.g. Adajan, Surat"
                className="min-w-0 flex-1 border-none bg-transparent px-4 py-4 text-base placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md bg-primary px-6 py-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-10 md:px-10">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">
                Featured listings
              </h2>
              <p className="text-on-surface-variant">
                Recently published properties.
              </p>
            </div>
            <Link
              href="/search"
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all
              <ArrowRightIcon className="size-[18px]" />
            </Link>
          </div>

          {featured.results.length === 0 ? (
            <p className="text-on-surface-variant">
              No published listings yet - check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.results.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>

        <section className="bg-surface-container py-10">
          <div className="mx-auto max-w-[1440px] px-4 text-center md:px-10">
            <h2 className="mb-10 text-2xl font-bold text-on-surface">
              How it works
            </h2>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              <HowItWorksStep
                title="Search"
                description="Browse listings by location, price, type, and bedrooms."
              />
              <HowItWorksStep
                title="Review the details"
                description="See photos, specs, amenities, and the map location for any listing."
              />
              <HowItWorksStep
                title="Ask questions"
                description="Chat with our AI assistant for help narrowing down your search."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant bg-surface-container-highest">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-4 py-6 text-center md:px-10">
          <span className="font-bold text-on-surface">Property Website</span>
          <p className="text-sm text-on-surface-variant">
            <Link href="/search" className="hover:text-on-surface hover:underline">
              Browse listings
            </Link>
            {" · "}
            <Link href="/login" className="hover:text-on-surface hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}

function HowItWorksStep({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-3 text-lg font-semibold text-on-surface">{title}</h3>
      <p className="max-w-xs text-on-surface-variant">{description}</p>
    </div>
  );
}
