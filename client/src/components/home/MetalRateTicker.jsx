import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import api from "../../services/api";

const DEFAULT_STATE = "Uttar Pradesh";
const AUTO_REFRESH_MS = 5 * 60 * 1000;

const formatRate = (value) => {
  const amount = Number(value);

  if (!amount || Number.isNaN(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatUpdatedTime = (value) => {
  if (!value) return "Updating";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Updating";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MetalRateTicker() {
  const [states, setStates] = useState([DEFAULT_STATE]);
  const [selectedState, setSelectedState] = useState(DEFAULT_STATE);
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState("");

  const selectedStateRef = useRef(DEFAULT_STATE);

  useEffect(() => {
    selectedStateRef.current = selectedState;
  }, [selectedState]);

  const loadStates = async () => {
    try {
      const { data } = await api.get("/rates/states");

      if (Array.isArray(data?.states) && data.states.length > 0) {
        setStates(data.states);

        const defaultState = data.defaultState || DEFAULT_STATE;
        setSelectedState(defaultState);
        selectedStateRef.current = defaultState;

        return defaultState;
      }

      return DEFAULT_STATE;
    } catch (requestError) {
      console.error("Unable to load rate states:", requestError);

      setStates([DEFAULT_STATE]);
      setSelectedState(DEFAULT_STATE);
      selectedStateRef.current = DEFAULT_STATE;

      return DEFAULT_STATE;
    }
  };

  const loadRates = async (
    state = selectedStateRef.current,
    silent = false,
  ) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setError("");

      const { data } = await api.get("/rates/metals", {
        params: {
          state,
        },
      });

      setRatesData(data);
    } catch (requestError) {
      console.error("Unable to load metal rates:", requestError);

      setRatesData(null);
      setError("Rates are temporarily unavailable. Please try again shortly.");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const initialiseRates = async () => {
      const defaultState = await loadStates();
      await loadRates(defaultState);
    };

    initialiseRates();
  }, []);

  useEffect(() => {
    const refreshInterval = window.setInterval(() => {
      loadRates(selectedStateRef.current, true);
    }, AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    const handleMarketRateUpdate = (event) => {
      if (event.key === "vjj_market_rates_updated_at" || event.key === null) {
        loadRates(selectedStateRef.current, true);
      }
    };

    window.addEventListener("storage", handleMarketRateUpdate);

    return () => {
      window.removeEventListener("storage", handleMarketRateUpdate);
    };
  }, []);

  const handleStateChange = async (event) => {
    const state = event.target.value;

    setSelectedState(state);
    selectedStateRef.current = state;

    await loadRates(state);
  };

  const handleManualRefresh = async () => {
    await loadRates(selectedStateRef.current);
  };

  const rateItems = [
    {
      label: "24K Gold",
      mobileLabel: "24K",
      value: ratesData?.rates?.gold24kPer10g,
      unit: "/10g",
    },
    {
      label: "22K Gold",
      mobileLabel: "22K",
      value: ratesData?.rates?.gold22kPer10g,
      unit: "/10g",
    },
    {
      label: "18K Gold",
      mobileLabel: "18K",
      value: ratesData?.rates?.gold18kPer10g,
      unit: "/10g",
    },
    {
      label: "Silver",
      mobileLabel: "Silver",
      value: ratesData?.rates?.silverPerKg,
      unit: "/kg",
    },
  ];

  const sourceLabel =
    ratesData?.displayMode === "manual"
      ? "Store Rate"
      : "Live Market Reference";

  return (
    <section className="border-b border-vjj-gold/20 bg-vjj-espresso text-vjj-champagne">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-5 lg:px-8">
        {/* Desktop Top Bar */}
        <div className="hidden min-h-[48px] items-center gap-4 lg:flex">
          <div className="flex shrink-0 items-center gap-2 border-r border-vjj-champagne/20 pr-4">
            <Sparkles size={15} className="text-vjj-gold" />

            <span className="text-xs font-black uppercase tracking-[0.16em]">
              Today&apos;s Rates
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <MapPin size={14} className="text-vjj-gold" />

            <select
              value={selectedState}
              onChange={handleStateChange}
              className="max-w-[180px] cursor-pointer appearance-none bg-transparent text-xs font-bold text-vjj-champagne outline-none"
              aria-label="Select state for market rates"
            >
              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                  className="bg-vjj-espresso text-vjj-champagne"
                >
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            {rateItems.map((item) => (
              <RateItem
                key={item.label}
                label={item.label}
                value={item.value}
                unit={item.unit}
                loading={loading}
              />
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-3 border-l border-vjj-champagne/20 pl-4">
            <span className="text-[11px] font-semibold text-vjj-champagne/65">
              {sourceLabel} · {formatUpdatedTime(ratesData?.updatedAt)}
            </span>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={loading}
              className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-vjj-champagne transition hover:bg-vjj-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Refresh market rates"
            >
              <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Mobile Compact Bar */}
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="flex min-h-[50px] w-full items-center justify-between gap-3 py-2 text-left lg:hidden"
          aria-expanded={mobileOpen}
          aria-label="Open gold and silver rates"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles size={16} className="shrink-0 text-vjj-gold" />

            <div className="min-w-0">
              <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-vjj-champagne">
                Today&apos;s Gold & Silver Rates
              </p>

              <p className="mt-0.5 truncate text-xs font-semibold text-vjj-champagne/70">
                {selectedState} · 24K{" "}
                {loading
                  ? "Updating..."
                  : formatRate(ratesData?.rates?.gold24kPer10g)}
              </p>
            </div>
          </div>

          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-vjj-champagne">
            {mobileOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </div>
        </button>

        {/* Mobile Expanded View */}
        {mobileOpen && (
          <div className="border-t border-vjj-champagne/20 pb-4 pt-3 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <MapPin size={14} className="shrink-0 text-vjj-gold" />

                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="w-full min-w-0 cursor-pointer appearance-none bg-transparent text-sm font-bold text-vjj-champagne outline-none"
                  aria-label="Select state for market rates"
                >
                  {states.map((state) => (
                    <option
                      key={state}
                      value={state}
                      className="bg-vjj-espresso text-vjj-champagne"
                    >
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={loading}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-vjj-champagne transition hover:bg-vjj-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
              {rateItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-vjj-champagne/15 bg-white/[0.05] px-3 py-2.5"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-vjj-gold">
                    {item.mobileLabel}
                  </p>

                  <p className="mt-1 text-sm font-bold text-vjj-champagne">
                    {loading ? "Updating..." : formatRate(item.value)}
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold text-vjj-champagne/60">
                    {item.unit}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-1 text-[10px] font-semibold text-vjj-champagne/60">
              <p>Source: {sourceLabel}</p>

              <p>
                Updated: {formatUpdatedTime(ratesData?.updatedAt)} · Final price
                may vary with GST, making charges and store policy.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="border-t border-red-300/20 py-2 text-center text-xs font-semibold text-red-200">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}

function RateItem({ label, value, unit, loading }) {
  return (
    <div className="flex min-w-0 items-baseline gap-1.5">
      <p className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.13em] text-vjj-gold">
        {label}
      </p>

      <p className="whitespace-nowrap text-sm font-bold text-vjj-champagne">
        {loading ? (
          <Loader2 size={14} className="inline animate-spin" />
        ) : (
          formatRate(value)
        )}
      </p>

      <span className="whitespace-nowrap text-[10px] font-semibold text-vjj-champagne/55">
        {unit}
      </span>
    </div>
  );
}
