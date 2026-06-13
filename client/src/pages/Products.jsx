import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import { fetchProducts } from "../features/products/productSlice";
import ProductCard from "../components/product/ProductCard";
import { CATEGORIES } from "../utils/constants";

const MATERIALS = [
  "Gold",
  "Diamond",
  "Silver",
  "Platinum",
  "Rose Gold",
  "Gemstone",
];

const PURITIES = ["9KT", "14KT", "18KT", "22KT", "24KT", "925 Silver"];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
];

export default function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, loading, error } = useSelector((state) => state.products);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [openSections, setOpenSections] = useState({
    category: true,
    material: true,
    purity: false,
    availability: false,
  });

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      material: searchParams.get("material") || "",
      purity: searchParams.get("purity") || "",
      sort: searchParams.get("sort") || "newest",
      readyToShip: searchParams.get("readyToShip") || "",
      featured: searchParams.get("featured") || "",
    }),
    [searchParams],
  );

  useEffect(() => {
    const params = {
      sort: filters.sort,
      limit: 100,
    };

    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.material) params.material = filters.material;
    if (filters.purity) params.purity = filters.purity;
    if (filters.readyToShip === "true") params.readyToShip = true;
    if (filters.featured === "true") params.featured = true;

    dispatch(fetchProducts(params));
  }, [dispatch, filters]);

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setShowMobileFilters(false);
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.material ||
    filters.purity ||
    filters.readyToShip ||
    filters.featured ||
    filters.sort !== "newest";

  return (
    <section className="min-h-screen bg-vjj-ivory">
      <div className="relative overflow-hidden bg-vjj-black px-5 py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,197,107,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-vjj-champagne">
            VJJ Collection
          </p>

          <h1 className="mt-4 font-serif text-5xl font-bold md:text-7xl">
            Explore Jewellery
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            Search and filter premium jewellery by category, material, purity,
            ready-to-ship status and price sorting.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div className="relative w-full">
            <Search
              size={19}
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-stone-400"
            />

            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search by name, SKU or tag..."
              className="h-14 w-full rounded-full border border-black/10 bg-white pl-14 pr-5 text-sm text-vjj-black outline-none transition placeholder:text-stone-400 focus:border-vjj-gold focus:bg-white focus:shadow-lg"
            />
          </div>

          <select
            value={filters.sort}
            onChange={(event) => updateFilter("sort", event.target.value)}
            className="h-14 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-vjj-black outline-none focus:border-vjj-gold"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-vjj-black px-5 text-sm font-semibold text-white lg:hidden"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>

        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {filters.search && (
              <FilterPill
                label={`Search: ${filters.search}`}
                onClear={() => updateFilter("search", "")}
              />
            )}

            {filters.category && (
              <FilterPill
                label={`Category: ${filters.category}`}
                onClear={() => updateFilter("category", "")}
              />
            )}

            {filters.material && (
              <FilterPill
                label={`Material: ${filters.material}`}
                onClear={() => updateFilter("material", "")}
              />
            )}

            {filters.purity && (
              <FilterPill
                label={`Purity: ${filters.purity}`}
                onClear={() => updateFilter("purity", "")}
              />
            )}

            {filters.readyToShip === "true" && (
              <FilterPill
                label="Ready To Ship"
                onClear={() => updateFilter("readyToShip", "")}
              />
            )}

            {filters.featured === "true" && (
              <FilterPill
                label="Featured"
                onClear={() => updateFilter("featured", "")}
              />
            )}

            {filters.sort !== "newest" && (
              <FilterPill
                label={`Sort: ${
                  SORT_OPTIONS.find((item) => item.value === filters.sort)
                    ?.label || filters.sort
                }`}
                onClear={() => updateFilter("sort", "newest")}
              />
            )}

            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <X size={15} />
              Clear All
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
          <aside
            className={`${
              showMobileFilters ? "block" : "hidden"
            } h-fit rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm lg:block`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-vjj-bronze">
                  Refine
                </p>
                <h2 className="font-serif text-3xl font-bold">Filters</h2>
              </div>

              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-red-600 hover:underline"
              >
                Clear
              </button>
            </div>

            <CollapsibleFilterSection
              title="Category"
              open={openSections.category}
              onToggle={() => toggleSection("category")}
            >
              <FilterButton
                label="All Categories"
                active={!filters.category}
                onClick={() => updateFilter("category", "")}
              />

              {CATEGORIES.map((category) => (
                <FilterButton
                  key={category}
                  label={category}
                  active={filters.category === category}
                  onClick={() => updateFilter("category", category)}
                />
              ))}
            </CollapsibleFilterSection>

            <CollapsibleFilterSection
              title="Material"
              open={openSections.material}
              onToggle={() => toggleSection("material")}
            >
              <FilterButton
                label="All Materials"
                active={!filters.material}
                onClick={() => updateFilter("material", "")}
              />

              {MATERIALS.map((material) => (
                <FilterButton
                  key={material}
                  label={material}
                  active={filters.material === material}
                  onClick={() => updateFilter("material", material)}
                />
              ))}
            </CollapsibleFilterSection>

            <CollapsibleFilterSection
              title="Purity"
              open={openSections.purity}
              onToggle={() => toggleSection("purity")}
            >
              <FilterButton
                label="All Purity"
                active={!filters.purity}
                onClick={() => updateFilter("purity", "")}
              />

              {PURITIES.map((purity) => (
                <FilterButton
                  key={purity}
                  label={purity}
                  active={filters.purity === purity}
                  onClick={() => updateFilter("purity", purity)}
                />
              ))}
            </CollapsibleFilterSection>

            <CollapsibleFilterSection
              title="Availability"
              open={openSections.availability}
              onToggle={() => toggleSection("availability")}
            >
              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-vjj-ivory px-4 py-3 text-sm font-semibold">
                <span>Ready To Ship</span>
                <input
                  type="checkbox"
                  checked={filters.readyToShip === "true"}
                  onChange={(event) =>
                    updateFilter(
                      "readyToShip",
                      event.target.checked ? "true" : "",
                    )
                  }
                />
              </label>

              <label className="mt-3 flex cursor-pointer items-center justify-between rounded-2xl bg-vjj-ivory px-4 py-3 text-sm font-semibold">
                <span>Featured Products</span>
                <input
                  type="checkbox"
                  checked={filters.featured === "true"}
                  onChange={(event) =>
                    updateFilter("featured", event.target.checked ? "true" : "")
                  }
                />
              </label>
            </CollapsibleFilterSection>
          </aside>

          <div>
            <div className="mb-5 flex items-center justify-between rounded-[2rem] border border-black/10 bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-sm text-stone-500">Showing</p>
                <h3 className="font-serif text-2xl font-bold">
                  {loading ? "Loading..." : `${products.length} Products`}
                </h3>
              </div>

              <p className="hidden text-sm text-stone-500 md:block">
                Premium jewellery from Verma ji jewellers
              </p>
            </div>

            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-[560px] animate-pulse rounded-[2rem] bg-white"
                  />
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="rounded-[2rem] border border-black/10 bg-white p-10 text-center shadow-sm">
                <h2 className="font-serif text-4xl font-bold">
                  No products found
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-stone-600">
                  Try clearing filters or search with another jewellery name,
                  SKU or tag.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-7 rounded-full bg-vjj-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CollapsibleFilterSection({ title, open, onToggle, children }) {
  return (
    <div className="border-t border-black/10 py-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-2xl px-1 py-2 text-left"
      >
        <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-stone-500">
          {title}
        </h3>

        <ChevronDown
          size={18}
          className={`text-stone-500 transition ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {open && <div className="mt-3 grid gap-2">{children}</div>}
    </div>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? "bg-vjj-black text-white"
          : "bg-vjj-ivory text-vjj-black hover:bg-stone-100"
      }`}
    >
      {label}
    </button>
  );
}

function FilterPill({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-vjj-black shadow-sm">
      {label}

      <button
        type="button"
        onClick={onClear}
        className="grid h-5 w-5 place-items-center rounded-full bg-vjj-ivory text-vjj-black hover:bg-red-100 hover:text-red-600"
      >
        <X size={13} />
      </button>
    </span>
  );
}
