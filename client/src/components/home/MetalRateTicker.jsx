import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Gem, Loader2, RefreshCcw, Sparkles } from "lucide-react";

import {
  getAvailableRateStates,
  getLiveMetalRates,
} from "../../services/metalRates";

const defaultState = "Uttar Pradesh";

const formatRate = (value) => {
  if (!value) return "Updating";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatUpdatedAt = (value) => {
  if (!value) return "Just now";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MetalRateTicker() {
  const states = useMemo(() => getAvailableRateStates(), []);

  const [selectedState, setSelectedState] = useState(defaultState);
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRates = async (stateName = selectedState) => {
    try {
      setLoading(true);
      const data = await getLiveMetalRates(stateName);
      setRates(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates(defaultState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStateChange = async (event) => {
    const value = event.target.value;
    setSelectedState(value);
    await loadRates(value);
  };

  const rateCards = [
    {
      label: "24K Gold",
      value: rates?.gold24kPer10g,
      unit: "per 10g",
    },
    {
      label: "22K Gold",
      value: rates?.gold22kPer10g,
      unit: "per 10g",
    },
    {
      label: "18K Gold",
      value: rates?.gold18kPer10g,
      unit: "per 10g",
    },
    {
      label: "Silver",
      value: rates?.silverPerKg,
      unit: "per 1kg",
    },
  ];

  return (
    <section className="px-4 pt-4 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="overflow-hidden rounded-[1.5rem] border border-vjj-champagne bg-vjj-cream shadow-[0_18px_55px_rgba(52,34,23,0.08)]">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-vjj-espresso text-vjj-champagne">
                <Gem size={21} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-vjj-black sm:text-2xl">
                    Today&apos;s Gold & Silver Rates
                  </h2>

                  {loading && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-vjj-soft px-3 py-1 text-xs font-bold text-vjj-coffee">
                      <Loader2 size={13} className="animate-spin" />
                      Updating
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs font-semibold text-vjj-coffee sm:text-sm">
                  Indicative live market rate for {selectedState}. Final store
                  price may vary.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="h-11 w-full appearance-none rounded-full border border-vjj-champagne bg-vjj-soft pl-4 pr-10 text-sm font-bold text-vjj-black outline-none transition focus:border-vjj-gold sm:w-56"
                >
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-vjj-coffee"
                />
              </div>

              <button
                type="button"
                onClick={() => loadRates(selectedState)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-vjj-espresso px-5 text-sm font-bold text-vjj-champagne transition hover:bg-vjj-gold hover:text-white"
              >
                <RefreshCcw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid border-t border-vjj-champagne bg-white/55 sm:grid-cols-2 lg:grid-cols-4">
            {rateCards.map((item) => (
              <div
                key={item.label}
                className="border-b border-vjj-champagne p-4 last:border-b-0 sm:border-l sm:first:border-l-0 lg:border-b-0 lg:border-l lg:first:border-l-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-vjj-gold">
                    {item.label}
                  </p>

                  <Sparkles size={15} className="text-vjj-bronze" />
                </div>

                <p className="mt-2 font-serif text-2xl font-bold text-vjj-black sm:text-3xl">
                  {formatRate(item.value)}
                </p>

                <p className="mt-1 text-xs font-bold text-vjj-coffee">
                  {item.unit}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 border-t border-vjj-champagne bg-vjj-soft px-4 py-3 text-xs font-semibold text-vjj-coffee sm:flex-row sm:items-center sm:justify-between">
            <p>
              Last updated:{" "}
              <span className="font-bold text-vjj-black">
                {formatUpdatedAt(rates?.updatedAt)}
              </span>
            </p>

            <p>
              Source: {rates?.source || "Live market API"} · Excludes making
              charges, GST and store-specific pricing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
