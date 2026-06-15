import { useEffect, useMemo, useState } from "react";
import { Filter, RefreshCcw, Search, SlidersHorizontal, X } from "lucide-react";
import toast from "react-hot-toast";

import api from "../services/api";
import ProductCard from "../components/product/ProductCard";
import { CATEGORIES } from "../utils/constants";

const MATERIALS = ["Gold", "Silver", "Diamond", "Platinum", "Gemstone"];
const PURITIES = ["18K", "22K", "24K", "925 Silver"];
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
];

const initialFilters = {
  search: "",
  category: "",
  material: "",
  purity: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    return Object.entries(appliedFilters).filter(([key, value]) => {
      if (key === "sort") return value !== "newest";
      return Boolean(value);
    }).length;
  }, [appliedFilters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = {};

      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.category) params.category = appliedFilters.category;
      if (appliedFilters.material) params.material = appliedFilters.material;
      if (appliedFilters.purity) params.purity = appliedFilters.purity;
      if (appliedFilters.minPrice) params.minPrice = appliedFilters.minPrice;
      if (appliedFilters.maxPrice) params.maxPrice = appliedFilters.maxPrice;
      if (appliedFilters.sort) params.sort = appliedFilters.sort;

      const { data } = await api.get("/products", { params });

      setProducts(data.products || data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [appliedFilters]);

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = (event) => {
    event?.preventDefault();
    setAppliedFilters(filters);
    setMobileFiltersOpen(false);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setMobileFiltersOpen(false);
  };

  return (
    <section className="bg-vjj-ivory px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] bg-vjj-black p-6 text-white shadow-luxury md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-champagne">
            Jewellery Collection
          </p>

          <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="font-serif text-5xl font-bold md:text-6xl">
                Explore Products
              </h1>

              <p className="mt-4 max-w-2xl text-stone-300">
                Discover handpicked gold, silver and jewellery collections from
                Verma ji jewellers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-champagne px-6 py-3 text-sm font-bold text-vjj-black transition hover:bg-vjj-gold lg:hidden"
            >
              <SlidersHorizontal size={17} />
              Filters
              {activeFilterCount > 0 && (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-vjj-black text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="hidden lg:block">
            <FilterPanel
              filters={filters}
              onChange={handleChange}
              onApply={applyFilters}
              onReset={resetFilters}
              activeFilterCount={activeFilterCount}
            />
          </aside>

          <main>
            <div className="mb-6 flex flex-col justify-between gap-4 rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-sm md:flex-row md:items-center">
              <div>
                <p className="font-serif text-2xl font-bold text-vjj-black">
                  {loading ? "Loading..." : `${products.length} Products Found`}
                </p>

                <p className="text-sm text-stone-600">
                  Use filters to find the perfect jewellery faster.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
                  >
                    <X size={16} />
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  onClick={fetchProducts}
                  className="inline-flex items-center gap-2 rounded-full bg-vjj-black px-4 py-2 text-sm font-bold text-white transition hover:bg-vjj-bronze"
                >
                  <RefreshCcw size={16} />
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <div className="rounded-[2rem] border border-black/10 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
                  <Search />
                </div>

                <h2 className="mt-5 font-serif text-3xl font-bold text-vjj-black">
                  No products found
                </h2>

                <p className="mt-2 text-stone-600">
                  Try changing your search or filter options.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 rounded-full bg-vjj-black px-6 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 px-5 py-8 backdrop-blur-sm lg:hidden">
          <div className="mx-auto max-h-[90vh] max-w-md overflow-y-auto rounded-[2rem] bg-vjj-ivory p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-bold text-vjj-black">
                Filters
              </h2>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full border border-black/10 bg-white p-2"
              >
                <X size={20} />
              </button>
            </div>

            <FilterPanel
              filters={filters}
              onChange={handleChange}
              onApply={applyFilters}
              onReset={resetFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function FilterPanel({
  filters,
  onChange,
  onApply,
  onReset,
  activeFilterCount,
}) {
  return (
    <form
      onSubmit={onApply}
      className="sticky top-28 rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
            <Filter size={18} />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-vjj-black">
              Filters
            </h2>
            <p className="text-xs text-stone-500">{activeFilterCount} active</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-vjj-bronze hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-vjj-black">
            Search
          </span>

          <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3">
            <Search size={17} className="text-stone-400" />
            <input
              value={filters.search}
              onChange={(event) => onChange("search", event.target.value)}
              placeholder="Search ring, bangle, SKU..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          </div>
        </label>

        <SelectField
          label="Category"
          value={filters.category}
          onChange={(value) => onChange("category", value)}
          options={CATEGORIES}
        />

        <SelectField
          label="Material"
          value={filters.material}
          onChange={(value) => onChange("material", value)}
          options={MATERIALS}
        />

        <SelectField
          label="Purity"
          value={filters.purity}
          onChange={(value) => onChange("purity", value)}
          options={PURITIES}
        />

        <div>
          <span className="mb-2 block text-sm font-bold text-vjj-black">
            Price Range
          </span>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={(event) => onChange("minPrice", event.target.value)}
              placeholder="Min"
              className="rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3 text-sm outline-none focus:border-vjj-gold"
            />

            <input
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(event) => onChange("maxPrice", event.target.value)}
              placeholder="Max"
              className="rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3 text-sm outline-none focus:border-vjj-gold"
            />
          </div>
        </div>

        <SelectField
          label="Sort By"
          value={filters.sort}
          onChange={(value) => onChange("sort", value)}
          options={SORT_OPTIONS}
          optionType="object"
        />
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze"
      >
        Apply Filters
      </button>
    </form>
  );
}

function SelectField({ label, value, onChange, options, optionType = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-vjj-black">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3 text-sm outline-none focus:border-vjj-gold"
      >
        <option value="">All</option>

        {options.map((option) => {
          const optionValue = optionType === "object" ? option.value : option;
          const optionLabel = optionType === "object" ? option.label : option;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="h-[430px] animate-pulse rounded-[2rem] bg-white"
        />
      ))}
    </div>
  );
}
