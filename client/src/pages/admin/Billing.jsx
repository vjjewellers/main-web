import { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  Check,
  FileText,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const DEFAULT_STATE = "Uttar Pradesh";

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: DEFAULT_STATE,
  pincode: "",
  gstin: "",
};

const emptyItem = {
  product: "",
  productName: "",
  sku: "",
  hsnCode: "7113",
  material: "",
  purity: "",
  quantity: 1,
  grossWeightGrams: "",
  lessWeightGrams: "0",
  ratePerGram: "",
  stoneValue: "0",
  makingChargeType: "flat",
  makingChargeValue: "0",
  discountAmount: "0",
  gstPercent: "3",
};

const paymentModes = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mixed", label: "Mixed" },
  { value: "other", label: "Other" },
];

const states = [
  "Uttar Pradesh",
  "Bihar",
  "West Bengal",
  "Delhi",
  "Maharashtra",
  "Gujarat",
  "Rajasthan",
  "Madhya Pradesh",
  "Jharkhand",
  "Odisha",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Andhra Pradesh",
  "Kerala",
  "Punjab",
  "Haryana",
  "Assam",
  "Other",
];

const numberValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatWeight = (value) => {
  const weight = numberValue(value);

  if (!weight) return "0 g";

  return `${weight.toFixed(3).replace(/\.?0+$/, "")} g`;
};

const getProductRateItem = (product) => {
  const pricing = product?.jewelleryPricing || {};

  return {
    product: product?._id || "",
    productName: product?.name || "",
    sku: product?.sku || "",
    hsnCode: "7113",
    material: product?.material || "",
    purity: product?.purity || "",
    quantity: 1,
    grossWeightGrams: pricing.grossWeightGrams || "",
    lessWeightGrams: pricing.lessWeightGrams || "0",
    ratePerGram: pricing.ratePerGram || "",
    stoneValue: pricing.stoneValue || "0",
    makingChargeType: pricing.makingChargeType || "flat",
    makingChargeValue:
      pricing.makingChargeValue || product?.makingCharge || "0",
    discountAmount: pricing.discountAmount || "0",
    gstPercent: pricing.gstPercent || product?.gstPercent || "3",
  };
};

export default function Billing() {
  const [customer, setCustomer] = useState(emptyCustomer);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ ...emptyItem }]);

  const [paymentMode, setPaymentMode] = useState("cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [salesperson, setSalesperson] = useState("");
  const [notes, setNotes] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [preview, setPreview] = useState(null);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const { data } = await api.get("/products/admin/all", {
        params: {
          limit: 300,
        },
      });

      setProducts(data.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return products.slice(0, 20);
    }

    return products
      .filter((product) => {
        return (
          product.name?.toLowerCase().includes(search) ||
          product.sku?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search) ||
          product.material?.toLowerCase().includes(search) ||
          product.purity?.toLowerCase().includes(search)
        );
      })
      .slice(0, 30);
  }, [products, productSearch]);

  const updateCustomer = (field, value) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const selectProductForItem = (index, product) => {
    const nextItem = getProductRateItem(product);

    setItems((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index ? nextItem : item,
      ),
    );

    toast.success(`${product.name} added to bill`);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      toast.error("At least one item is required");
      return;
    }

    setItems((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const buildInvoicePayload = () => {
    return {
      customer,
      paymentMode,
      paymentReference,
      salesperson,
      notes,
      items: items.map((item) => ({
        product: item.product || null,
        productName: item.productName,
        sku: item.sku,
        hsnCode: item.hsnCode || "7113",
        material: item.material,
        purity: item.purity,
        quantity: Number(item.quantity || 1),
        grossWeightGrams: Number(item.grossWeightGrams || 0),
        lessWeightGrams: Number(item.lessWeightGrams || 0),
        ratePerGram: Number(item.ratePerGram || 0),
        stoneValue: Number(item.stoneValue || 0),
        makingChargeType: item.makingChargeType || "flat",
        makingChargeValue: Number(item.makingChargeValue || 0),
        discountAmount: Number(item.discountAmount || 0),
        gstPercent: Number(item.gstPercent || 3),
      })),
    };
  };

  const validateBill = () => {
    if (!customer.name.trim()) {
      toast.error("Customer name is required");
      return false;
    }

    const invalidItem = items.find((item) => {
      return (
        !item.productName.trim() ||
        Number(item.grossWeightGrams || 0) <= 0 ||
        Number(item.ratePerGram || 0) <= 0
      );
    });

    if (invalidItem) {
      toast.error("Each item needs product name, gross weight and rate");
      return false;
    }

    return true;
  };

  const previewInvoice = async () => {
    if (!validateBill()) return;

    try {
      setPreviewLoading(true);

      const { data } = await api.post(
        "/invoices/preview",
        buildInvoicePayload(),
      );

      setPreview(data.preview);
      toast.success("Invoice calculation updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to preview invoice");
    } finally {
      setPreviewLoading(false);
    }
  };

  const saveInvoice = async () => {
    if (!validateBill()) return;

    try {
      setSaving(true);

      const { data } = await api.post("/invoices", buildInvoicePayload());

      toast.success("Invoice created successfully");

      const invoiceId = data.invoice?._id;

      if (invoiceId) {
        window.location.assign(`/admin/invoices/${invoiceId}`);
        return;
      }

      setCustomer(emptyCustomer);
      setItems([{ ...emptyItem }]);
      setPreview(null);
      setPaymentMode("cash");
      setPaymentReference("");
      setSalesperson("");
      setNotes("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            Retail Billing
          </p>

          <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
            Create Jewellery Bill
          </h1>

          <p className="mt-3 max-w-2xl text-stone-600">
            Generate GST-ready jewellery invoice with product weight, gold rate,
            making charge and tax calculation.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={previewInvoice}
            disabled={previewLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Calculator size={17} />
            {previewLoading ? "Calculating..." : "Preview Calculation"}
          </button>

          <button
            type="button"
            onClick={saveInvoice}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            <Check size={17} />
            {saving ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <main className="space-y-6">
          <FormSection
            icon={<UserRound size={18} />}
            title="Customer Details"
            description="Customer information will appear on the printed bill."
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InputField
                label="Customer Name"
                value={customer.name}
                onChange={(value) => updateCustomer("name", value)}
                required
              />

              <InputField
                label="Mobile Number"
                value={customer.phone}
                onChange={(value) => updateCustomer("phone", value)}
              />

              <InputField
                label="Email"
                value={customer.email}
                onChange={(value) => updateCustomer("email", value)}
              />

              <InputField
                label="Address"
                value={customer.address}
                onChange={(value) => updateCustomer("address", value)}
                className="md:col-span-2"
              />

              <InputField
                label="City"
                value={customer.city}
                onChange={(value) => updateCustomer("city", value)}
              />

              <SelectField
                label="State"
                value={customer.state}
                onChange={(value) => updateCustomer("state", value)}
                options={states}
              />

              <InputField
                label="Pincode"
                value={customer.pincode}
                onChange={(value) => updateCustomer("pincode", value)}
              />

              <InputField
                label="Customer GSTIN"
                value={customer.gstin}
                onChange={(value) => updateCustomer("gstin", value)}
                placeholder="Optional"
              />
            </div>
          </FormSection>

          <FormSection
            icon={<Search size={18} />}
            title="Product Selector"
            description="Search product and add it to bill. You can edit the billing values after selection."
          >
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
              <Search size={18} className="text-stone-400" />

              <input
                type="text"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Search product by name, SKU, material or purity..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
              />

              <button
                type="button"
                onClick={fetchProducts}
                className="grid h-8 w-8 place-items-center rounded-full bg-vjj-ivory text-vjj-black transition hover:bg-vjj-black hover:text-white"
              >
                <RefreshCcw size={15} />
              </button>
            </div>

            {loadingProducts ? (
              <div className="rounded-2xl bg-white p-5 text-sm font-semibold text-stone-600">
                Loading products...
              </div>
            ) : (
              <div className="grid max-h-80 gap-3 overflow-y-auto pr-1">
                {filteredProducts.map((product) => (
                  <ProductSelectCard
                    key={product._id}
                    product={product}
                    onSelect={() => {
                      const emptyIndex = items.findIndex(
                        (item) => !item.productName,
                      );

                      if (emptyIndex >= 0) {
                        selectProductForItem(emptyIndex, product);
                      } else {
                        setItems((prev) => [
                          ...prev,
                          getProductRateItem(product),
                        ]);

                        toast.success(`${product.name} added to bill`);
                      }
                    }}
                  />
                ))}

                {filteredProducts.length === 0 && (
                  <div className="rounded-2xl bg-white p-5 text-sm font-semibold text-stone-600">
                    No product found.
                  </div>
                )}
              </div>
            )}
          </FormSection>

          <FormSection
            icon={<FileText size={18} />}
            title="Billing Items"
            description="Edit final weight, rate, making charge, discount or GST before saving invoice."
          >
            <div className="space-y-4">
              {items.map((item, index) => (
                <BillingItemCard
                  key={`${item.product || "manual"}-${index}`}
                  item={item}
                  index={index}
                  onChange={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
            >
              <Plus size={16} />
              Add Manual Item
            </button>
          </FormSection>

          <FormSection
            icon={<Printer size={18} />}
            title="Payment & Notes"
            description="Payment details and internal invoice note."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Payment Mode"
                value={paymentMode}
                onChange={setPaymentMode}
                options={paymentModes.map((mode) => mode.value)}
                optionLabels={paymentModes.reduce((acc, mode) => {
                  acc[mode.value] = mode.label;
                  return acc;
                }, {})}
              />

              <InputField
                label="Payment Reference"
                value={paymentReference}
                onChange={setPaymentReference}
                placeholder="UPI ref / card txn / optional"
              />

              <InputField
                label="Salesperson"
                value={salesperson}
                onChange={setSalesperson}
                placeholder="Optional"
              />

              <InputField
                label="Notes"
                value={notes}
                onChange={setNotes}
                placeholder="Optional"
              />
            </div>
          </FormSection>
        </main>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <InvoiceSummary preview={preview} customer={customer} />
        </aside>
      </div>
    </div>
  );
}

function ProductSelectCard({ product, onSelect }) {
  const pricing = product.jewelleryPricing || {};

  return (
    <button
      type="button"
      onClick={onSelect}
      className="rounded-2xl border border-black/10 bg-white p-4 text-left transition hover:border-vjj-gold hover:bg-vjj-cream"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-serif text-xl font-bold text-vjj-black">
            {product.name}
          </p>

          <p className="mt-1 text-xs font-semibold text-stone-500">
            SKU: {product.sku || "N/A"} · {product.material || "Metal"} ·{" "}
            {product.purity || "Purity"}
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-stone-600">
            <span>{formatWeight(pricing.netWeightGrams)}</span>
            <span>Rate: {formatCurrency(pricing.ratePerGram || 0)}/g</span>
            <span>Stock: {product.stock || 0}</span>
          </div>
        </div>

        <p className="shrink-0 rounded-full bg-vjj-black px-3 py-1 text-xs font-bold text-white">
          Add
        </p>
      </div>
    </button>
  );
}

function BillingItemCard({ item, index, onChange, onRemove }) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-vjj-bronze">
            Item {index + 1}
          </p>

          <h3 className="mt-1 font-serif text-2xl font-bold text-vjj-black">
            {item.productName || "Manual Jewellery Item"}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => onRemove(index)}
          className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-700 transition hover:bg-red-100"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InputField
          label="Product Name"
          value={item.productName}
          onChange={(value) => onChange(index, "productName", value)}
          required
          className="md:col-span-2"
        />

        <InputField
          label="SKU"
          value={item.sku}
          onChange={(value) => onChange(index, "sku", value)}
        />

        <InputField
          label="HSN"
          value={item.hsnCode}
          onChange={(value) => onChange(index, "hsnCode", value)}
        />

        <InputField
          label="Material"
          value={item.material}
          onChange={(value) => onChange(index, "material", value)}
        />

        <InputField
          label="Purity"
          value={item.purity}
          onChange={(value) => onChange(index, "purity", value)}
        />

        <InputField
          label="Quantity"
          type="number"
          value={item.quantity}
          onChange={(value) => onChange(index, "quantity", value)}
        />

        <InputField
          label="Gross Wt. gm"
          type="number"
          value={item.grossWeightGrams}
          onChange={(value) => onChange(index, "grossWeightGrams", value)}
          required
        />

        <InputField
          label="Less Wt. gm"
          type="number"
          value={item.lessWeightGrams}
          onChange={(value) => onChange(index, "lessWeightGrams", value)}
        />

        <InputField
          label="Rate / gm"
          type="number"
          value={item.ratePerGram}
          onChange={(value) => onChange(index, "ratePerGram", value)}
          required
        />

        <InputField
          label="Stone / Add. Value"
          type="number"
          value={item.stoneValue}
          onChange={(value) => onChange(index, "stoneValue", value)}
        />

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-vjj-black">
            Making Type
          </span>

          <select
            value={item.makingChargeType}
            onChange={(event) =>
              onChange(index, "makingChargeType", event.target.value)
            }
            className="w-full rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3 text-sm font-semibold outline-none focus:border-vjj-gold"
          >
            <option value="flat">Flat</option>
            <option value="per_gram">Per Gram</option>
            <option value="percentage">Percentage</option>
          </select>
        </label>

        <InputField
          label="Making Value"
          type="number"
          value={item.makingChargeValue}
          onChange={(value) => onChange(index, "makingChargeValue", value)}
        />

        <InputField
          label="Discount"
          type="number"
          value={item.discountAmount}
          onChange={(value) => onChange(index, "discountAmount", value)}
        />

        <InputField
          label="GST %"
          type="number"
          value={item.gstPercent}
          onChange={(value) => onChange(index, "gstPercent", value)}
        />
      </div>
    </div>
  );
}

function InvoiceSummary({ preview, customer }) {
  const totals = preview?.totals;

  return (
    <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-vjj-black text-vjj-champagne">
          <Calculator size={18} />
        </div>

        <div>
          <h2 className="font-serif text-3xl font-bold text-vjj-black">
            Bill Summary
          </h2>
          <p className="text-sm text-stone-600">
            Preview before saving invoice.
          </p>
        </div>
      </div>

      {!preview ? (
        <div className="rounded-3xl bg-vjj-ivory p-6 text-center">
          <p className="text-sm font-semibold text-stone-600">
            Add customer and items, then click Preview Calculation.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-3xl bg-vjj-ivory p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
              Customer
            </p>

            <p className="mt-2 font-serif text-2xl font-bold text-vjj-black">
              {customer.name}
            </p>

            <p className="mt-1 text-sm text-stone-600">
              {customer.state || DEFAULT_STATE} ·{" "}
              {preview.taxType === "intra_state" ? "CGST + SGST" : "IGST"}
            </p>
          </div>

          <SummaryRow
            label="Gross Weight"
            value={formatWeight(totals.grossWeightGrams)}
          />
          <SummaryRow
            label="Net Weight"
            value={formatWeight(totals.netWeightGrams)}
          />
          <SummaryRow
            label="Metal Value"
            value={formatCurrency(totals.metalValue)}
          />
          <SummaryRow
            label="Stone / Additional"
            value={formatCurrency(totals.stoneValue)}
          />
          <SummaryRow
            label="Making Charges"
            value={formatCurrency(totals.makingChargeAmount)}
          />
          <SummaryRow
            label="Discount"
            value={`- ${formatCurrency(totals.discountAmount)}`}
          />
          <SummaryRow
            label="Taxable Value"
            value={formatCurrency(totals.taxableValue)}
          />

          {preview.taxType === "intra_state" ? (
            <>
              <SummaryRow
                label="CGST"
                value={formatCurrency(totals.cgstAmount)}
              />
              <SummaryRow
                label="SGST"
                value={formatCurrency(totals.sgstAmount)}
              />
            </>
          ) : (
            <SummaryRow
              label="IGST"
              value={formatCurrency(totals.igstAmount)}
            />
          )}

          <SummaryRow
            label="Round Off"
            value={formatCurrency(totals.roundOff)}
          />

          <div className="mt-5 rounded-[1.5rem] bg-vjj-black p-5 text-vjj-champagne">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-vjj-gold">
              Grand Total
            </p>

            <p className="mt-2 font-serif text-4xl font-bold">
              {formatCurrency(totals.grandTotal)}
            </p>

            <p className="mt-2 text-xs font-semibold text-vjj-champagne/70">
              {preview.amountInWords}
            </p>
          </div>
        </>
      )}
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 py-3 text-sm">
      <span className="font-semibold text-stone-600">{label}</span>
      <span className="font-bold text-vjj-black">{value}</span>
    </div>
  );
}

function FormSection({ icon, title, description, children }) {
  return (
    <section className="rounded-[2rem] border border-black/10 bg-vjj-ivory p-5 shadow-sm">
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

function SelectField({ label, value, onChange, options, optionLabels = {} }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-vjj-black">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-vjj-gold"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels[option] || option}
          </option>
        ))}
      </select>
    </label>
  );
}
