// Property.type is a free string (SCHEMA.md §3, no enum table) - these are
// just the values the seed script uses. A real admin-entered type outside
// this list still works fine as a filter value typed into the URL; this is
// only the convenience dropdown.
const TYPE_OPTIONS = ["apartment", "house", "villa"];

export function SearchFilters({
  defaultValues,
}: {
  defaultValues: {
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    type?: string;
    bedrooms?: string;
    sort?: string;
  };
}) {
  return (
    <form
      action="/search"
      method="GET"
      className="flex flex-wrap items-end gap-4 rounded-md border border-outline-variant bg-surface-container-lowest p-4"
    >
      <div className="flex min-w-[200px] flex-1 flex-col gap-1">
        <label htmlFor="q" className="text-xs font-semibold text-on-surface-variant">
          Location
        </label>
        <input
          id="q"
          type="text"
          name="q"
          defaultValue={defaultValues.q}
          placeholder="City or neighborhood"
          className="rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="type" className="text-xs font-semibold text-on-surface-variant">
          Type
        </label>
        <select
          id="type"
          name="type"
          defaultValue={defaultValues.type ?? ""}
          className="rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Any</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="bedrooms" className="text-xs font-semibold text-on-surface-variant">
          Bedrooms
        </label>
        <select
          id="bedrooms"
          name="bedrooms"
          defaultValue={defaultValues.bedrooms ?? ""}
          className="rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="minPrice" className="text-xs font-semibold text-on-surface-variant">
          Min price (₹)
        </label>
        <input
          id="minPrice"
          type="number"
          name="minPrice"
          defaultValue={defaultValues.minPrice}
          placeholder="0"
          className="w-28 rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="maxPrice" className="text-xs font-semibold text-on-surface-variant">
          Max price (₹)
        </label>
        <input
          id="maxPrice"
          type="number"
          name="maxPrice"
          defaultValue={defaultValues.maxPrice}
          placeholder="Any"
          className="w-28 rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="sort" className="text-xs font-semibold text-on-surface-variant">
          Sort by
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={defaultValues.sort ?? "date_desc"}
          className="rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="date_desc">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded-md bg-primary px-6 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
      >
        Apply
      </button>
      {Object.values(defaultValues).some(Boolean) ? (
        <a
          href="/search"
          className="text-sm font-semibold text-on-surface-variant hover:text-primary hover:underline"
        >
          Clear all
        </a>
      ) : null}
    </form>
  );
}
