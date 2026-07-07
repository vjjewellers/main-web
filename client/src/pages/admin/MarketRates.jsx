import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Cloud,
  Loader2,
  RefreshCcw,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";

const getTodayIndia = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

const formatCurrency = (value) => {
  if (!value) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const emptyRates = {
  gold24kPer10g: "",
  gold22kPer10g: "",
  gold18kPer10g: "",
  silverPerKg: "",
};

export default function MarketRates() {
  const [states, setStates] = useState(["Uttar Pradesh"]);
  const [selectedState, setSelectedState] = useState("Uttar Pradesh");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingReference, setLoadingReference] = useState(false);

  const [manualEnabled, setManualEnabled] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(getTodayIndia());
  const [rates, setRates] = useState(emptyRates);
  const [notes, setNotes] = useState("");

  const [status, setStatus] = useState(null);
  const [apiReference, setApiReference] = useState(null);

  const statusType = useMemo(() => {
    if (!status) return "loading";
    return status.manualIsActiveToday ? "manual" : "api";
  }, [status]);

  const loadStates = async () => {
    try {
      const { data } = await api.get("/rates/states");

      if (Array.isArray(data.states) && data.states.length > 0) {
        setStates(data.states);

        if (data.defaultState) {
          setSelectedState(data.defaultState);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load state list");
    }
  };

  const loadSettings = async (state = selectedState) => {
    try {
      setLoading(true);

      const { data } = await api.get("/admin/market-rates", {
        params: { state },
      });

      setStatus(data);

      const setting = data.setting;

      setManualEnabled(Boolean(setting?.isManualActive));
      setEffectiveDate(
        setting?.effectiveDate || data.todayIndia || getTodayIndia(),
      );

      setRates({
        gold24kPer10g: setting?.rates?.gold24kPer10g || "",
        gold22kPer10g: setting?.rates?.gold22kPer10g || "",
        gold18kPer10g: setting?.rates?.gold18kPer10g || "",
        silverPerKg: setting?.rates?.silverPerKg || "",
      });

      setNotes(setting?.notes || "");
    } catch (error) {
      console.error(error);
      toast.error("Unable to load manual rate settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialise = async () => {
      await loadStates();
      await loadSettings("Uttar Pradesh");
    };

    initialise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStateChange = async (event) => {
    const state = event.target.value;
    setSelectedState(state);
    setApiReference(null);
    await loadSettings(state);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setRates((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const getLiveReference = async () => {
    try {
      setLoadingReference(true);

      const { data } = await api.get("/admin/market-rates/live-reference");

      setApiReference(data);
      toast.success("Live API reference loaded");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Unable to load live API reference",
      );
    } finally {
      setLoadingReference(false);
    }
  };

  const useApiValues = () => {
    if (!apiReference?.rates) return;

    setRates({
      gold24kPer10g: apiReference.rates.gold24kPer10g || "",
      gold22kPer10g: apiReference.rates.gold22kPer10g || "",
      gold18kPer10g: apiReference.rates.gold18kPer10g || "",
      silverPerKg: apiReference.rates.silverPerKg || "",
    });

    toast.success("API reference values copied to the form");
  };

  const saveRates = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const { data } = await api.put(
        `/admin/market-rates/${encodeURIComponent(selectedState)}`,
        {
          isManualActive: manualEnabled,
          effectiveDate,
          gold24kPer10g: rates.gold24kPer10g,
          gold22kPer10g: rates.gold22kPer10g,
          gold18kPer10g: rates.gold18kPer10g,
          silverPerKg: rates.silverPerKg,
          notes,
        },
      );

      toast.success(data.message);
      await loadSettings(selectedState);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Unable to save manual rates",
      );
    } finally {
      setSaving(false);
    }
  };

  const disableManualRate = async () => {
    try {
      setSaving(true);

      const { data } = await api.patch(
        `/admin/market-rates/${encodeURIComponent(selectedState)}/disable`,
      );

      setManualEnabled(false);
      toast.success(data.message);
      await loadSettings(selectedState);
    } catch (error) {
      console.error(error);
      toast.error("Unable to disable manual rates");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-vjj-ivory px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] border border-vjj-champagne bg-vjj-cream p-5 shadow-[0_20px_70px_rgba(52,34,23,0.08)] sm:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-vjj-gold">
                Store Control Centre
              </p>

              <h1 className="mt-2 font-serif text-4xl font-bold text-vjj-black">
                Daily Gold & Silver Rates
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-vjj-coffee">
                Add your store&apos;s manual jewellery rates for today. When
                manual mode is disabled or rates are not updated for today, the
                website automatically uses the live API reference.
              </p>
            </div>

            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
                statusType === "manual"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-vjj-champagne bg-vjj-soft text-vjj-coffee"
              }`}
            >
              <div className="flex items-center gap-2">
                {statusType === "manual" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Cloud size={18} />
                )}

                {statusType === "manual"
                  ? "Manual Store Rate Active"
                  : "Live API Fallback Active"}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.6fr]">
            <aside className="rounded-[1.5rem] border border-vjj-champagne bg-vjj-soft p-5">
              <label className="text-sm font-bold text-vjj-black">
                Select State
              </label>

              <select
                value={selectedState}
                onChange={handleStateChange}
                className="mt-2 h-12 w-full rounded-xl border border-vjj-champagne bg-white px-4 text-sm font-bold text-vjj-black outline-none focus:border-vjj-gold"
              >
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>

              <div className="mt-6 rounded-2xl border border-vjj-champagne bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-vjj-gold">
                  Display Rule
                </p>

                <p className="mt-3 text-sm leading-6 text-vjj-coffee">
                  Manual values appear only when:
                </p>

                <ul className="mt-3 space-y-2 text-sm font-semibold text-vjj-black">
                  <li>• Manual mode is enabled</li>
                  <li>• All four values are entered</li>
                  <li>• Effective date is today</li>
                </ul>

                <p className="mt-4 text-xs leading-5 text-vjj-coffee">
                  If you forget to update tomorrow&apos;s rate, the site safely
                  returns to the API value automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={getLiveReference}
                disabled={loadingReference}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-vjj-espresso px-5 py-3 text-sm font-bold text-vjj-champagne transition hover:bg-vjj-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingReference ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <RefreshCcw size={17} />
                )}
                Fetch Current API Reference
              </button>
            </aside>

            <form
              onSubmit={saveRates}
              className="rounded-[1.5rem] border border-vjj-champagne bg-white p-5 sm:p-6"
            >
              {loading ? (
                <div className="grid min-h-[420px] place-items-center">
                  <Loader2 size={30} className="animate-spin text-vjj-gold" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 border-b border-vjj-champagne pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-vjj-black">
                        {selectedState} Rate Settings
                      </h2>

                      <p className="mt-1 text-sm text-vjj-coffee">
                        Enter values in Indian Rupees.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setManualEnabled((current) => !current)}
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                        manualEnabled
                          ? "bg-green-600 text-white"
                          : "bg-vjj-soft text-vjj-coffee"
                      }`}
                    >
                      {manualEnabled ? (
                        <ToggleRight size={20} />
                      ) : (
                        <ToggleLeft size={20} />
                      )}
                      Manual Mode {manualEnabled ? "On" : "Off"}
                    </button>
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-bold text-vjj-black">
                      Effective Date
                    </label>

                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(event) => setEffectiveDate(event.target.value)}
                      className="mt-2 h-12 w-full rounded-xl border border-vjj-champagne bg-vjj-cream px-4 text-sm font-bold text-vjj-black outline-none focus:border-vjj-gold"
                    />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <RateInput
                      label="24K Gold Rate"
                      name="gold24kPer10g"
                      value={rates.gold24kPer10g}
                      onChange={handleInputChange}
                      unit="₹ per 10g"
                    />

                    <RateInput
                      label="22K Gold Rate"
                      name="gold22kPer10g"
                      value={rates.gold22kPer10g}
                      onChange={handleInputChange}
                      unit="₹ per 10g"
                    />

                    <RateInput
                      label="18K Gold Rate"
                      name="gold18kPer10g"
                      value={rates.gold18kPer10g}
                      onChange={handleInputChange}
                      unit="₹ per 10g"
                    />

                    <RateInput
                      label="Silver Rate"
                      name="silverPerKg"
                      value={rates.silverPerKg}
                      onChange={handleInputChange}
                      unit="₹ per 1kg"
                    />
                  </div>

                  {apiReference?.rates && (
                    <div className="mt-5 rounded-2xl border border-vjj-champagne bg-vjj-soft p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-vjj-gold">
                            API Reference
                          </p>

                          <p className="mt-1 text-sm font-semibold text-vjj-coffee">
                            Updated{" "}
                            {new Date(apiReference.updatedAt).toLocaleString(
                              "en-IN",
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={useApiValues}
                          className="rounded-full border border-vjj-gold bg-white px-4 py-2 text-xs font-bold text-vjj-black transition hover:bg-vjj-gold hover:text-white"
                        >
                          Copy API Values to Form
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
                        <ReferenceItem
                          label="24K"
                          value={apiReference.rates.gold24kPer10g}
                        />
                        <ReferenceItem
                          label="22K"
                          value={apiReference.rates.gold22kPer10g}
                        />
                        <ReferenceItem
                          label="18K"
                          value={apiReference.rates.gold18kPer10g}
                        />
                        <ReferenceItem
                          label="Silver"
                          value={apiReference.rates.silverPerKg}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-5">
                    <label className="text-sm font-bold text-vjj-black">
                      Internal Note{" "}
                      <span className="text-vjj-coffee">(optional)</span>
                    </label>

                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Example: Store rate updated after morning market confirmation."
                      rows={3}
                      maxLength={500}
                      className="mt-2 w-full rounded-xl border border-vjj-champagne bg-vjj-cream px-4 py-3 text-sm text-vjj-black outline-none placeholder:text-vjj-coffee/60 focus:border-vjj-gold"
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-vjj-espresso px-6 py-3.5 text-sm font-bold text-vjj-champagne transition hover:bg-vjj-gold hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Save Rate Settings
                    </button>

                    <button
                      type="button"
                      onClick={disableManualRate}
                      disabled={saving}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-6 py-3.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CircleAlert size={18} />
                      Use API Fallback
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function RateInput({ label, name, value, onChange, unit }) {
  return (
    <label className="rounded-2xl border border-vjj-champagne bg-vjj-cream p-4">
      <span className="text-sm font-bold text-vjj-black">{label}</span>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-lg font-bold text-vjj-gold">₹</span>

        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min="1"
          step="10"
          placeholder="Enter rate"
          className="w-full bg-transparent text-lg font-bold text-vjj-black outline-none placeholder:text-vjj-coffee/45"
        />
      </div>

      <span className="mt-2 block text-xs font-semibold text-vjj-coffee">
        {unit}
      </span>
    </label>
  );
}

function ReferenceItem({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-vjj-gold">
        {label}
      </p>
      <p className="mt-1 font-serif text-lg font-bold text-vjj-black">
        {formatCurrency(value)}
      </p>
    </div>
  );
}
