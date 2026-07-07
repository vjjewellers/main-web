import { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  Cloud,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const DEFAULT_STATE = "Uttar Pradesh";

const emptyPricing = {
  rateState: DEFAULT_STATE,
  rateSource: "custom",
  rateUpdatedAt: "",

  grossWeightGrams: "",
  lessWeightGrams: "0",
  netWeightGrams: "0",

  ratePerGram: "",
  metalValue: "0",

  stoneValue: "0",

  makingChargeType: "flat",
  makingChargeValue: "0",
  makingChargeAmount: "0",

  discountAmount: "0",

  gstPercent: "3",
  taxableValue: "0",
  gstAmount: "0",
  finalPrice: "0",
};

const numberValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundMoney = (value) => {
  return Math.round(numberValue(value) * 100) / 100;
};

const formatWeight = (value) => {
  const weight = numberValue(value);

  if (!weight) return "0 g";

  return `${weight.toFixed(3).replace(/\.?0+$/, "")} g`;
};

const getRatePerGram = (rates, purity) => {
  if (!rates) return 0;

  if (purity === "24K") {
    return numberValue(rates.gold24kPer10g) / 10;
  }

  if (purity === "22K") {
    return numberValue(rates.gold22kPer10g) / 10;
  }

  if (purity === "18K") {
    return numberValue(rates.gold18kPer10g) / 10;
  }

  if (purity === "925 Silver") {
    return numberValue(rates.silverPerKg) / 1000;
  }

  return 0;
};

const calculatePricing = (input) => {
  const grossWeightGrams = numberValue(input.grossWeightGrams);
  const lessWeightGrams = Math.max(0, numberValue(input.lessWeightGrams));

  const netWeightGrams = Math.max(
    0,
    roundMoney(grossWeightGrams - lessWeightGrams),
  );

  const ratePerGram = numberValue(input.ratePerGram);
  const metalValue = roundMoney(netWeightGrams * ratePerGram);

  const stoneValue = Math.max(0, numberValue(input.stoneValue));

  const makingChargeType = input.makingChargeType || "flat";
  const makingChargeValue = Math.max(0, numberValue(input.makingChargeValue));

  let makingChargeAmount = 0;

  if (makingChargeType === "per_gram") {
    makingChargeAmount = roundMoney(netWeightGrams * makingChargeValue);
  }

  if (makingChargeType === "percentage") {
    makingChargeAmount = roundMoney((metalValue * makingChargeValue) / 100);
  }

  if (makingChargeType === "flat") {
    makingChargeAmount = roundMoney(makingChargeValue);
  }

  const discountAmount = Math.max(0, numberValue(input.discountAmount));

  const gstPercent = Math.max(0, numberValue(input.gstPercent));

  const taxableValue = Math.max(
    0,
    roundMoney(metalValue + stoneValue + makingChargeAmount - discountAmount),
  );

  const gstAmount = roundMoney((taxableValue * gstPercent) / 100);

  const finalPrice = roundMoney(taxableValue + gstAmount);

  return {
    ...input,
    grossWeightGrams,
    lessWeightGrams,
    netWeightGrams,
    ratePerGram,
    metalValue,
    stoneValue,
    makingChargeType,
    makingChargeValue,
    makingChargeAmount,
    discountAmount,
    gstPercent,
    taxableValue,
    gstAmount,
    finalPrice,
  };
};

export { emptyPricing, calculatePricing };

export default function JewelleryPricingCalculator({
  material,
  purity,
  value,
  onChange,
}) {
  const [states, setStates] = useState([DEFAULT_STATE]);
  const [marketRateData, setMarketRateData] = useState(null);
  const [loadingRates, setLoadingRates] = useState(false);

  const pricing = useMemo(() => {
    return calculatePricing({
      ...emptyPricing,
      ...value,
    });
  }, [value]);

  const isRateSupported =
    material === "Gold" ||
    material === "Silver" ||
    purity === "24K" ||
    purity === "22K" ||
    purity === "18K" ||
    purity === "925 Silver";

  const loadStates = async () => {
    try {
      const { data } = await api.get("/rates/states");

      if (Array.isArray(data?.states) && data.states.length > 0) {
        setStates(data.states);
      }
    } catch (error) {
      console.error("Unable to load rate states:", error);
    }
  };

  const loadMarketRate = async (
    state = pricing.rateState || DEFAULT_STATE,
    autoFill = false,
  ) => {
    try {
      setLoadingRates(true);

      const { data } = await api.get("/rates/metals", {
        params: { state },
      });

      setMarketRateData(data);

      const ratePerGram = getRatePerGram(data?.rates, purity);

      const nextPricing = calculatePricing({
        ...pricing,
        rateState: state,
        rateSource: data?.displayMode === "manual" ? "manual" : "api",
        rateUpdatedAt: data?.updatedAt || new Date().toISOString(),
        ratePerGram:
          autoFill && ratePerGram > 0 ? ratePerGram : pricing.ratePerGram,
      });

      onChange(nextPricing);

      if (autoFill && ratePerGram > 0) {
        toast.success(
          `${purity || "Metal"} rate added from ${
            data?.displayMode === "manual"
              ? "Store Rate"
              : "Live Market Reference"
          }`,
        );
      }
    } catch (error) {
      console.error("Unable to load market rates:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to fetch market rate right now",
      );
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (!isRateSupported || !purity) return;

    loadMarketRate(pricing.rateState || DEFAULT_STATE, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purity, material]);

  const updatePricing = (field, nextValue) => {
    const nextPricing = calculatePricing({
      ...pricing,
      [field]: nextValue,
    });

    onChange(nextPricing);
  };

  const copyLiveRateToForm = () => {
    const ratePerGram = getRatePerGram(marketRateData?.rates, purity);

    if (!ratePerGram) {
      toast.error(
        `A live rate is not available for ${purity || "this purity"}`,
      );
      return;
    }

    const nextPricing = calculatePricing({
      ...pricing,
      ratePerGram,
      rateSource: marketRateData?.displayMode === "manual" ? "manual" : "api",
      rateUpdatedAt: marketRateData?.updatedAt || new Date().toISOString(),
    });

    onChange(nextPricing);

    toast.success("Current rate copied to product calculator");
  };

  const sourceLabel =
    pricing.rateSource === "manual"
      ? "Store Rate"
      : pricing.rateSource === "api"
        ? "Live Market Reference"
        : "Custom Rate";

  return (
    <section className="rounded-[1.5rem] border border-vjj-champagne bg-vjj-soft p-5">
      <div className="flex flex-col justify-between gap-4 border-b border-vjj-champagne pb-5 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-vjj-espresso text-vjj-champagne">
              <Calculator size={19} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-vjj-gold">
                Jewellery Price Engine
              </p>

              <h3 className="mt-1 font-serif text-2xl font-bold text-vjj-black">
                Live Product Price Calculator
              </h3>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-vjj-coffee">
            Final selling price is calculated automatically from weight, current
            metal rate, stone value, making charges, discount and GST.
          </p>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
            pricing.rateSource === "manual"
              ? "bg-green-100 text-green-800"
              : pricing.rateSource === "api"
                ? "bg-vjj-cream text-vjj-coffee"
                : "bg-white text-vjj-coffee"
          }`}
        >
          {pricing.rateSource === "manual" ? (
            <CheckCircle2 size={15} />
          ) : (
            <Cloud size={15} />
          )}

          {sourceLabel}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Field label="Rate State">
          <select
            value={pricing.rateState}
            onChange={(event) => {
              updatePricing("rateState", event.target.value);
              loadMarketRate(event.target.value, false);
            }}
            className="w-full rounded-2xl border border-vjj-champagne bg-white px-4 py-3 text-sm font-bold text-vjj-black outline-none focus:border-vjj-gold"
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Metal Rate Per Gram">
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={pricing.ratePerGram}
              onChange={(event) =>
                updatePricing("ratePerGram", event.target.value)
              }
              placeholder="0"
              className="min-w-0 flex-1 rounded-2xl border border-vjj-champagne bg-white px-4 py-3 text-sm font-bold text-vjj-black outline-none focus:border-vjj-gold"
            />

            <button
              type="button"
              onClick={() => loadMarketRate(pricing.rateState, true)}
              disabled={loadingRates || !isRateSupported}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-vjj-espresso px-4 py-3 text-xs font-bold text-vjj-champagne transition hover:bg-vjj-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              title="Fetch latest metal rate"
            >
              <RefreshCcw
                size={16}
                className={loadingRates ? "animate-spin" : ""}
              />
              Rate
            </button>
          </div>
        </Field>

        <Field label="Rate Source">
          <div className="rounded-2xl border border-vjj-champagne bg-white px-4 py-3">
            <p className="text-sm font-bold text-vjj-black">{sourceLabel}</p>
            <p className="mt-1 text-xs text-vjj-coffee">
              {pricing.rateUpdatedAt
                ? new Date(pricing.rateUpdatedAt).toLocaleString("en-IN")
                : "Use Rate button to refresh"}
            </p>
          </div>
        </Field>
      </div>

      {!isRateSupported && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Live rate autofill is currently available for Gold and Silver. Enter a
          custom rate per gram for other materials.
        </div>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <NumberField
          label="Gross Weight"
          unit="grams"
          value={pricing.grossWeightGrams}
          onChange={(nextValue) => updatePricing("grossWeightGrams", nextValue)}
          placeholder="0.000"
        />

        <NumberField
          label="Less / Stone Weight"
          unit="grams"
          value={pricing.lessWeightGrams}
          onChange={(nextValue) => updatePricing("lessWeightGrams", nextValue)}
          placeholder="0.000"
        />

        <ReadOnlyField
          label="Net Weight"
          value={formatWeight(pricing.netWeightGrams)}
        />

        <ReadOnlyField
          label="Metal Value"
          value={formatCurrency(pricing.metalValue)}
        />

        <NumberField
          label="Stone / Additional Value"
          unit="₹"
          value={pricing.stoneValue}
          onChange={(nextValue) => updatePricing("stoneValue", nextValue)}
          placeholder="0"
        />

        <Field label="Making Charge Type">
          <select
            value={pricing.makingChargeType}
            onChange={(event) =>
              updatePricing("makingChargeType", event.target.value)
            }
            className="w-full rounded-2xl border border-vjj-champagne bg-white px-4 py-3 text-sm font-bold text-vjj-black outline-none focus:border-vjj-gold"
          >
            <option value="flat">Flat Amount</option>
            <option value="per_gram">Per Gram</option>
            <option value="percentage">Percentage</option>
          </select>
        </Field>

        <NumberField
          label={
            pricing.makingChargeType === "per_gram"
              ? "Making Charge / Gram"
              : pricing.makingChargeType === "percentage"
                ? "Making Charge %"
                : "Making Charge Amount"
          }
          unit={pricing.makingChargeType === "percentage" ? "%" : "₹"}
          value={pricing.makingChargeValue}
          onChange={(nextValue) =>
            updatePricing("makingChargeValue", nextValue)
          }
          placeholder="0"
        />

        <ReadOnlyField
          label="Making Charge Total"
          value={formatCurrency(pricing.makingChargeAmount)}
        />

        <NumberField
          label="Discount"
          unit="₹"
          value={pricing.discountAmount}
          onChange={(nextValue) => updatePricing("discountAmount", nextValue)}
          placeholder="0"
        />

        <NumberField
          label="GST"
          unit="%"
          value={pricing.gstPercent}
          onChange={(nextValue) => updatePricing("gstPercent", nextValue)}
          placeholder="3"
        />

        <ReadOnlyField
          label="Taxable Value"
          value={formatCurrency(pricing.taxableValue)}
        />

        <ReadOnlyField
          label="GST Amount"
          value={formatCurrency(pricing.gstAmount)}
        />
      </div>

      <div className="mt-6 rounded-[1.5rem] bg-vjj-espresso p-5 text-vjj-champagne">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-vjj-gold">
              Final Selling Price
            </p>

            <p className="mt-2 font-serif text-4xl font-bold">
              {formatCurrency(pricing.finalPrice)}
            </p>

            <p className="mt-2 text-xs font-semibold text-vjj-champagne/70">
              Metal value + additional value + making charge − discount + GST
            </p>
          </div>

          {marketRateData?.rates && (
            <button
              type="button"
              onClick={copyLiveRateToForm}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-vjj-gold/50 bg-white/10 px-5 py-3 text-sm font-bold transition hover:bg-vjj-gold hover:text-white"
            >
              <Sparkles size={16} />
              Copy Current Rate
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-vjj-black">
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberField({ label, unit, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      <div className="flex overflow-hidden rounded-2xl border border-vjj-champagne bg-white focus-within:border-vjj-gold">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-bold text-vjj-black outline-none"
        />

        <span className="flex items-center border-l border-vjj-champagne bg-vjj-cream px-3 text-xs font-bold text-vjj-coffee">
          {unit}
        </span>
      </div>
    </Field>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <Field label={label}>
      <div className="rounded-2xl border border-vjj-champagne bg-vjj-cream px-4 py-3 text-sm font-bold text-vjj-black">
        {value}
      </div>
    </Field>
  );
}
