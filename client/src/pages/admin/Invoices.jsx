import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Eye,
  FileText,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const statusOptions = [
  { value: "", label: "All Invoices" },
  { value: "issued", label: "Issued" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
];

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

const getStatusClass = (status) => {
  if (status === "issued") {
    return "bg-green-50 text-green-700 border-green-100";
  }

  if (status === "draft") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  if (status === "cancelled") {
    return "bg-red-50 text-red-700 border-red-100";
  }

  return "bg-stone-50 text-stone-700 border-stone-100";
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState("");

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/invoices", {
        params: {
          search: searchTerm.trim() || undefined,
          status: statusFilter || undefined,
          limit: 100,
        },
      });

      setInvoices(data.invoices || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const totals = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        const grandTotal = Number(invoice?.totals?.grandTotal || 0);

        acc.totalAmount += grandTotal;

        if (invoice.status === "issued") {
          acc.issued += 1;
          acc.issuedAmount += grandTotal;
        }

        if (invoice.status === "draft") {
          acc.draft += 1;
        }

        if (invoice.status === "cancelled") {
          acc.cancelled += 1;
        }

        return acc;
      },
      {
        issued: 0,
        draft: 0,
        cancelled: 0,
        totalAmount: 0,
        issuedAmount: 0,
      },
    );
  }, [invoices]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchInvoices();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const cancelInvoice = async (invoice) => {
    const reason = window.prompt(
      `Enter cancellation reason for ${invoice.invoiceNumber}:`,
    );

    if (reason === null) return;

    try {
      setCancellingId(invoice._id);

      await api.patch(`/invoices/${invoice._id}/cancel`, {
        reason,
      });

      toast.success("Invoice cancelled successfully");
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel invoice");
    } finally {
      setCancellingId("");
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            Invoice Records
          </p>

          <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
            Manage Invoices
          </h1>

          <p className="mt-3 max-w-2xl text-stone-600">
            Search, view, print and cancel jewellery invoices from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fetchInvoices}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
          >
            <RefreshCcw size={17} />
            Refresh
          </button>

          <Link
            to="/admin/billing"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze"
          >
            <Plus size={17} />
            New Bill
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Loaded Invoices" value={invoices.length} />
        <StatCard label="Issued" value={totals.issued} success />
        <StatCard label="Draft" value={totals.draft} warning />
        <StatCard label="Cancelled" value={totals.cancelled} danger />
      </div>

      <div className="mb-6 rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
              <Search size={18} />
            </div>

            <div>
              <h2 className="font-serif text-3xl font-bold text-vjj-black">
                Invoice Search
              </h2>
              <p className="text-sm text-stone-600">
                Search by invoice number, customer name, phone or GSTIN.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full border border-black/10 bg-vjj-ivory px-5 py-2.5 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
          >
            Clear Filters
          </button>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="grid gap-4 lg:grid-cols-[1fr_220px_auto]"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3">
            <Search size={18} className="text-stone-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search invoice number, customer, phone..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3 text-sm font-semibold outline-none focus:border-vjj-gold"
          >
            {statusOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-2xl bg-vjj-black px-6 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze"
          >
            Search
          </button>
        </form>
      </div>

      <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold text-vjj-black">
              Invoice List
            </h2>
            <p className="text-sm text-stone-600">
              Showing {invoices.length} invoices. Issued value:{" "}
              <strong>{formatCurrency(totals.issuedAmount)}</strong>
            </p>
          </div>
        </div>

        {loading ? (
          <InvoiceListSkeleton />
        ) : invoices.length === 0 ? (
          <div className="rounded-3xl bg-vjj-ivory p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-vjj-bronze">
              <FileText />
            </div>

            <h3 className="mt-4 font-serif text-2xl font-bold text-vjj-black">
              No invoices found
            </h3>

            <p className="mt-2 text-stone-600">
              Create your first jewellery bill from the Billing page.
            </p>

            <Link
              to="/admin/billing"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-vjj-black px-5 py-3 text-sm font-bold text-white"
            >
              <Plus size={16} />
              Create Bill
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice._id}
                invoice={invoice}
                onCancel={cancelInvoice}
                cancelling={cancellingId === invoice._id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InvoiceCard({ invoice, onCancel, cancelling }) {
  const customer = invoice.customer || {};
  const totals = invoice.totals || {};

  return (
    <div className="rounded-3xl border border-black/10 bg-vjj-ivory p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-vjj-bronze">
          <FileText size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-2xl font-bold text-vjj-black">
              {invoice.invoiceNumber}
            </h3>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                invoice.status,
              )}`}
            >
              {invoice.status}
            </span>

            {invoice.taxType && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-600">
                {invoice.taxType === "intra_state" ? "CGST + SGST" : "IGST"}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-sm text-stone-600">
            <span>Date: {formatDate(invoice.invoiceDate)}</span>
            <span>· Customer: {customer.name || "—"}</span>
            {customer.phone && <span>· Mobile: {customer.phone}</span>}
            {customer.state && <span>· State: {customer.state}</span>}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="font-serif text-2xl font-bold text-vjj-black">
              {formatCurrency(totals.grandTotal || 0)}
            </p>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-600">
              Items: {invoice.items?.length || 0}
            </span>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-600">
              Payment: {String(invoice.paymentMode || "cash").replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Link
            to={`/admin/invoices/${invoice._id}`}
            className="inline-flex items-center gap-2 rounded-full bg-vjj-black px-4 py-2 text-sm font-bold text-white transition hover:bg-vjj-bronze"
          >
            <Eye size={15} />
            View / Print
          </Link>

          {invoice.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onCancel(invoice)}
              disabled={cancelling}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Ban size={15} />
              {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>

      {invoice.status === "cancelled" && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          This invoice is cancelled. It should not be used as an active bill.
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  success = false,
  warning = false,
  danger = false,
}) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
        {label}
      </p>

      <p
        className={`mt-3 font-serif text-3xl font-bold ${
          danger
            ? "text-red-700"
            : warning
              ? "text-amber-700"
              : success
                ? "text-green-700"
                : "text-vjj-black"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InvoiceListSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-36 animate-pulse rounded-3xl bg-vjj-ivory"
        />
      ))}
    </div>
  );
}
