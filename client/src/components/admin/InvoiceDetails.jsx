import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  Loader2,
  Printer,
  RefreshCcw,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";

import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const BRAND = {
  name: "Verma Ji Jewellers",
  phone: "+91 91200 69337",
  email: "jewellersvermaji@gmail.com",
  address:
    "Mahaveer Road, Mangal Ki Bazar, Kaptanganj, Kushinagar, Uttar Pradesh - 274301",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatWeight = (value) => {
  const number = Number(value || 0);

  if (!number) return "0 g";

  return `${number.toFixed(3).replace(/\.?0+$/, "")} g`;
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

const getInvoiceShareText = (invoice) => {
  return `Dear ${invoice?.customer?.name || "Customer"},

Thank you for shopping with Verma Ji Jewellers.

Invoice No: ${invoice?.invoiceNumber}
Invoice Date: ${formatDate(invoice?.invoiceDate)}
Total Amount: ${formatCurrency(invoice?.totals?.grandTotal || 0)}

Regards,
Verma Ji Jewellers`;
};

export default function InvoiceDetails() {
  const { invoiceId } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/invoices/${invoiceId}`);

      setInvoice(data.invoice);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const whatsappLink = useMemo(() => {
    if (!invoice) return "";

    const phone = String(invoice.customer?.phone || "").replace(/\D/g, "");
    const message = encodeURIComponent(getInvoiceShareText(invoice));

    if (phone.length >= 10) {
      return `https://wa.me/91${phone.slice(-10)}?text=${message}`;
    }

    return `https://wa.me/?text=${message}`;
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-5 py-10">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-4 text-vjj-black shadow-sm">
          <Loader2 className="animate-spin" size={20} />
          <span className="font-bold">Loading invoice...</span>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="px-5 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-white p-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-vjj-black">
            Invoice not found
          </h1>

          <Link
            to="/admin/billing"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-vjj-black px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Back to Billing
          </Link>
        </div>
      </div>
    );
  }

  const totals = invoice.totals || {};
  const customer = invoice.customer || {};
  const store = invoice.store || BRAND;

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="no-print mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <Link
            to="/admin/billing"
            className="inline-flex items-center gap-2 text-sm font-bold text-vjj-bronze transition hover:text-vjj-black"
          >
            <ArrowLeft size={16} />
            Back to Billing
          </Link>

          <p className="mt-5 text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            Invoice Preview
          </p>

          <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
            {invoice.invoiceNumber}
          </h1>

          <p className="mt-3 text-stone-600">
            Review, print or share this jewellery GST invoice.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fetchInvoice}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-5 py-3 text-sm font-bold text-green-700 transition hover:bg-green-100"
          >
            <Share2 size={16} />
            WhatsApp
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze"
          >
            <Printer size={16} />
            Print / Save PDF
          </button>
        </div>
      </div>

      <InvoicePaper invoice={invoice} />

      <div className="no-print mt-6 rounded-3xl border border-black/10 bg-white p-5 text-sm text-stone-600">
        <div className="flex items-start gap-3">
          <Download className="mt-0.5 shrink-0 text-vjj-bronze" size={18} />

          <p>
            To save PDF, click <strong>Print / Save PDF</strong>, then select{" "}
            <strong>Save as PDF</strong> in the print window.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          aside,
          nav,
          header,
          footer {
            display: none !important;
          }

          .admin-sidebar,
          .admin-header {
            display: none !important;
          }

          .invoice-print-area {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
            min-height: auto !important;
            border-radius: 0 !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}

function InvoicePaper({ invoice }) {
  const customer = invoice.customer || {};
  const store = invoice.store || BRAND;
  const totals = invoice.totals || {};
  const items = Array.isArray(invoice.items) ? invoice.items : [];

  return (
    <section className="invoice-print-area mx-auto max-w-[950px] overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
      <div className="border-b border-vjj-champagne bg-vjj-cream px-7 py-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-vjj-bronze">
              Tax Invoice
            </p>

            <h2 className="mt-2 font-serif text-4xl font-bold text-vjj-black">
              {store.name || BRAND.name}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">
              {store.address || BRAND.address}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-stone-600">
              <span>Phone: {store.phone || BRAND.phone}</span>
              <span>Email: {store.email || BRAND.email}</span>
              {store.gstin && <span>GSTIN: {store.gstin}</span>}
            </div>
          </div>

          <div className="rounded-3xl bg-vjj-black px-5 py-4 text-right text-vjj-champagne">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-vjj-gold">
              Invoice No.
            </p>

            <p className="mt-1 font-serif text-2xl font-bold">
              {invoice.invoiceNumber}
            </p>

            <p className="mt-3 text-xs font-semibold text-vjj-champagne/70">
              Date: {formatDate(invoice.invoiceDate)}
            </p>

            <p className="mt-1 text-xs font-semibold text-vjj-champagne/70">
              Status: {invoice.status}
            </p>
          </div>
        </div>
      </div>

      <div className="grid border-b border-vjj-champagne md:grid-cols-2">
        <InfoBlock title="Bill To">
          <p className="font-serif text-2xl font-bold text-vjj-black">
            {customer.name}
          </p>

          {customer.phone && (
            <p className="mt-1 text-sm text-stone-600">
              Mobile: {customer.phone}
            </p>
          )}

          {customer.email && (
            <p className="mt-1 text-sm text-stone-600">
              Email: {customer.email}
            </p>
          )}

          {(customer.address || customer.city || customer.pincode) && (
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {[
                customer.address,
                customer.city,
                customer.state,
                customer.pincode,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}

          {customer.gstin && (
            <p className="mt-2 text-sm font-bold text-vjj-black">
              GSTIN: {customer.gstin}
            </p>
          )}
        </InfoBlock>

        <InfoBlock title="Supply & Payment">
          <InvoiceMetaRow
            label="Place of Supply"
            value={invoice.placeOfSupply}
          />
          <InvoiceMetaRow
            label="Tax Type"
            value={
              invoice.taxType === "intra_state"
                ? "Intra-state: CGST + SGST"
                : "Inter-state: IGST"
            }
          />
          <InvoiceMetaRow label="Payment Mode" value={invoice.paymentMode} />
          {invoice.paymentReference && (
            <InvoiceMetaRow
              label="Payment Ref."
              value={invoice.paymentReference}
            />
          )}
          {invoice.salesperson && (
            <InvoiceMetaRow label="Salesperson" value={invoice.salesperson} />
          )}
        </InfoBlock>
      </div>

      <div className="px-5 py-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-vjj-black text-vjj-champagne">
                <TableHead className="rounded-l-2xl">#</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead>HSN</TableHead>
                <TableHead>G.Wt</TableHead>
                <TableHead>L.Wt</TableHead>
                <TableHead>N.Wt</TableHead>
                <TableHead>Rate/g</TableHead>
                <TableHead>Metal</TableHead>
                <TableHead>Making</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead>GST</TableHead>
                <TableHead className="rounded-r-2xl text-right">
                  Amount
                </TableHead>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr
                  key={`${item.productName}-${index}`}
                  className="border-b border-black/10 align-top"
                >
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>
                    <p className="font-bold text-vjj-black">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-[11px] text-stone-500">
                      SKU: {item.sku || "—"} · {item.material || "—"} ·{" "}
                      {item.purity || "—"}
                    </p>
                  </TableCell>

                  <TableCell>{item.hsnCode || "7113"}</TableCell>
                  <TableCell>{formatWeight(item.grossWeightGrams)}</TableCell>
                  <TableCell>{formatWeight(item.lessWeightGrams)}</TableCell>
                  <TableCell>{formatWeight(item.netWeightGrams)}</TableCell>
                  <TableCell>{formatCurrency(item.ratePerGram)}</TableCell>
                  <TableCell>{formatCurrency(item.metalValue)}</TableCell>
                  <TableCell>
                    {formatCurrency(item.makingChargeAmount)}
                  </TableCell>
                  <TableCell>{formatCurrency(item.taxableValue)}</TableCell>
                  <TableCell>{formatCurrency(item.gstAmount)}</TableCell>
                  <TableCell className="text-right font-bold text-vjj-black">
                    {formatCurrency(item.lineTotal)}
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_330px]">
          <div className="rounded-3xl border border-black/10 bg-vjj-ivory p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-vjj-bronze">
              Amount in Words
            </p>

            <p className="mt-2 font-serif text-xl font-bold text-vjj-black">
              {invoice.amountInWords}
            </p>

            {invoice.notes && (
              <>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-vjj-bronze">
                  Notes
                </p>
                <p className="mt-2 text-sm text-stone-600">{invoice.notes}</p>
              </>
            )}

            <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-vjj-bronze">
              Terms & Conditions
            </p>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              {invoice.terms ||
                "Goods once sold will not be taken back or exchanged."}
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-5">
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

            {invoice.taxType === "intra_state" ? (
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

            <div className="mt-4 rounded-2xl bg-vjj-black px-4 py-4 text-vjj-champagne">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-black uppercase tracking-[0.18em] text-vjj-gold">
                  Grand Total
                </span>

                <span className="font-serif text-3xl font-bold">
                  {formatCurrency(totals.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-8 border-t border-black/10 pt-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold text-vjj-black">
              Customer Signature
            </p>

            <div className="mt-12 w-56 border-t border-black/30" />
          </div>

          <div className="text-right">
            <p className="font-serif text-2xl font-bold text-vjj-black">
              For {store.name || BRAND.name}
            </p>

            <div className="ml-auto mt-12 w-56 border-t border-black/30" />

            <p className="mt-2 text-sm font-bold text-vjj-black">
              Authorised Signatory
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ title, children }) {
  return (
    <div className="border-b border-vjj-champagne px-7 py-5 md:border-b-0 md:border-r last:md:border-r-0">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-vjj-bronze">
        {title}
      </p>
      {children}
    </div>
  );
}

function InvoiceMetaRow({ label, value }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
      <span className="font-semibold text-stone-500">{label}</span>
      <span className="text-right font-bold capitalize text-vjj-black">
        {String(value || "—").replace("_", " ")}
      </span>
    </div>
  );
}

function TableHead({ children, className = "" }) {
  return (
    <th className={`px-3 py-3 text-[11px] font-black uppercase ${className}`}>
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }) {
  return (
    <td className={`px-3 py-4 text-[12px] text-stone-700 ${className}`}>
      {children}
    </td>
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
