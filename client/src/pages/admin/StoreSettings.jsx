import { useEffect, useState } from "react";
import {
  Check,
  FileText,
  Loader2,
  RefreshCcw,
  Settings,
  Store,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";

const defaultForm = {
  storeName: "Verma Ji Jewellers",
  gstin: "",
  phone: "+91 91200 69337",
  email: "jewellersvermaji@gmail.com",
  address:
    "Mahaveer Road, Mangal Ki Bazar, Kaptanganj, Kushinagar, Uttar Pradesh - 274301",
  state: "Uttar Pradesh",
  invoicePrefix: "VJJ",
  defaultHsnCode: "7113",
  defaultGstPercent: 3,
  terms:
    "Goods once sold will not be taken back or exchanged. Subject to Kushinagar jurisdiction.",
};

export default function StoreSettings() {
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/store-settings");

      setFormData({
        ...defaultForm,
        ...(data.settings || {}),
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load store settings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.storeName.trim()) {
      toast.error("Store name is required");
      return;
    }

    if (!formData.invoicePrefix.trim()) {
      toast.error("Invoice prefix is required");
      return;
    }

    try {
      setSaving(true);

      const { data } = await api.put("/store-settings", {
        ...formData,
        gstin: String(formData.gstin || "").toUpperCase(),
        invoicePrefix: String(formData.invoicePrefix || "").toUpperCase(),
        defaultGstPercent: Number(formData.defaultGstPercent || 0),
      });

      setFormData({
        ...defaultForm,
        ...(data.settings || {}),
      });

      toast.success("Store settings saved successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save store settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5 py-10">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-4 text-vjj-black shadow-sm">
          <Loader2 className="animate-spin" size={20} />
          <span className="font-bold">Loading store settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            Store Configuration
          </p>

          <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
            Invoice Settings
          </h1>

          <p className="mt-3 max-w-2xl text-stone-600">
            Manage shop details, GSTIN, invoice prefix, HSN code and default
            invoice terms.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm md:p-7"
      >
        <FormSection
          icon={<Store size={18} />}
          title="Store Details"
          description="These details will appear on the printable invoice."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Store Name"
              value={formData.storeName}
              onChange={(value) => handleChange("storeName", value)}
              required
            />

            <InputField
              label="GSTIN"
              value={formData.gstin}
              onChange={(value) => handleChange("gstin", value.toUpperCase())}
              placeholder="Optional"
            />

            <InputField
              label="Phone"
              value={formData.phone}
              onChange={(value) => handleChange("phone", value)}
            />

            <InputField
              label="Email"
              value={formData.email}
              onChange={(value) => handleChange("email", value)}
            />

            <InputField
              label="State"
              value={formData.state}
              onChange={(value) => handleChange("state", value)}
            />

            <TextareaField
              label="Address"
              value={formData.address}
              onChange={(value) => handleChange("address", value)}
              className="md:col-span-2"
            />
          </div>
        </FormSection>

        <FormSection
          icon={<FileText size={18} />}
          title="Invoice Defaults"
          description="These values are used when new bills are created."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <InputField
              label="Invoice Prefix"
              value={formData.invoicePrefix}
              onChange={(value) =>
                handleChange("invoicePrefix", value.toUpperCase())
              }
              required
            />

            <InputField
              label="Default HSN Code"
              value={formData.defaultHsnCode}
              onChange={(value) => handleChange("defaultHsnCode", value)}
            />

            <InputField
              label="Default GST %"
              type="number"
              value={formData.defaultGstPercent}
              onChange={(value) => handleChange("defaultGstPercent", value)}
            />

            <TextareaField
              label="Invoice Terms"
              value={formData.terms}
              onChange={(value) => handleChange("terms", value)}
              className="md:col-span-3"
            />
          </div>
        </FormSection>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-vjj-black px-7 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            <Check size={17} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormSection({ icon, title, description, children }) {
  return (
    <section className="mb-6 rounded-[1.5rem] border border-black/10 bg-vjj-ivory p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-vjj-bronze">
          {icon}
        </div>

        <div>
          <h2 className="font-serif text-3xl font-bold text-vjj-black">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-stone-600">{description}</p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-bold text-vjj-black">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-vjj-gold"
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-bold text-vjj-black">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-vjj-gold"
      />
    </label>
  );
}
