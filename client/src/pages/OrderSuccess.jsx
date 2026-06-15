import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Home,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

export default function OrderSuccess() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);

        setOrder(data.order || data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Unable to fetch order details",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const copyOrderNumber = async () => {
    const orderNumber = order?.orderNumber || order?._id || id;

    try {
      await navigator.clipboard.writeText(orderNumber);
      toast.success("Order number copied");
    } catch {
      toast.error("Unable to copy order number");
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-vjj-ivory px-5 py-16">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-white p-10 shadow-luxury">
          <div className="h-[520px] animate-pulse rounded-[2rem] bg-vjj-ivory" />
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="min-h-screen bg-vjj-ivory px-5 py-20">
        <div className="mx-auto max-w-3xl rounded-[2.5rem] bg-white p-10 text-center shadow-luxury">
          <h1 className="font-serif text-5xl font-bold text-vjj-black">
            Order not found
          </h1>

          <p className="mt-4 text-stone-600">
            We could not load this order. Please check your dashboard.
          </p>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex rounded-full bg-vjj-black px-8 py-3 text-sm font-bold text-white"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  const shippingAddress = order.shippingAddress || {};
  const items = order.items || order.orderItems || [];

  return (
    <section className="min-h-screen bg-vjj-ivory">
      <div className="relative overflow-hidden bg-vjj-black px-5 py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,197,107,0.2),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-vjj-champagne/30 bg-vjj-champagne/10 text-vjj-champagne shadow-glow">
            <CheckCircle2 size={52} />
          </div>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.35em] text-vjj-champagne">
            Order Confirmed
          </p>

          <h1 className="mt-4 font-serif text-5xl font-bold md:text-7xl">
            Thank You!
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            Your jewellery order has been placed successfully. Our team will
            contact you soon for confirmation and delivery updates.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm text-stone-500">Order Number</p>

                <h2 className="mt-1 font-serif text-3xl font-bold text-vjj-black">
                  {order.orderNumber || order._id}
                </h2>
              </div>

              <button
                type="button"
                onClick={copyOrderNumber}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-vjj-ivory"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <InfoCard
                icon={<ReceiptText size={22} />}
                label="Total Amount"
                value={formatCurrency(order.totalAmount || order.total || 0)}
              />

              <InfoCard
                icon={<PackageCheck size={22} />}
                label="Order Status"
                value={order.orderStatus || order.status || "Placed"}
              />

              <InfoCard
                icon={<Truck size={22} />}
                label="Payment"
                value={order.paymentStatus || "Pending"}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-bold text-vjj-black">
              Ordered Items
            </h2>

            <div className="mt-6 space-y-4">
              {items.length === 0 ? (
                <p className="text-stone-500">No items found.</p>
              ) : (
                items.map((item, index) => {
                  const product = item.product || item;
                  const image =
                    item.image ||
                    product.image ||
                    product.images?.find((img) => img.isPrimary)?.url ||
                    product.images?.[0]?.url ||
                    "";

                  const name = item.name || product.name || "Product";
                  const price = Number(item.price || product.price || 0);
                  const quantity = Number(item.quantity || 1);

                  return (
                    <div
                      key={item._id || `${name}-${index}`}
                      className="flex gap-4 rounded-2xl border border-black/10 p-3"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-vjj-ivory">
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-vjj-bronze">
                            <ShoppingBag size={26} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 font-bold text-vjj-black">
                          {name}
                        </p>

                        <p className="mt-1 text-sm text-stone-500">
                          Qty: {quantity}
                          {item.selectedSize
                            ? ` · Size: ${item.selectedSize}`
                            : ""}
                          {item.selectedMaterial
                            ? ` · ${item.selectedMaterial}`
                            : ""}
                        </p>

                        <p className="mt-3 font-bold text-vjj-black">
                          {formatCurrency(price * quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-bold text-vjj-black">
              Delivery Details
            </h2>

            <div className="mt-6 space-y-4 text-sm">
              <DetailRow label="Name" value={shippingAddress.fullName} />
              <DetailRow label="Phone" value={shippingAddress.phone} />
              <DetailRow label="Email" value={shippingAddress.email} />
              <DetailRow
                label="Address"
                value={[
                  shippingAddress.addressLine1 || shippingAddress.line1,
                  shippingAddress.addressLine2 || shippingAddress.line2,
                  shippingAddress.city,
                  shippingAddress.state,
                  shippingAddress.pincode,
                  shippingAddress.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-3xl font-bold text-vjj-black">
              What Happens Next?
            </h2>

            <div className="mt-6 space-y-4">
              <Step
                number="01"
                title="Order Review"
                text="Our team will verify your order and product availability."
              />

              <Step
                number="02"
                title="Confirmation Call"
                text="You may receive a call or message for order confirmation."
              />

              <Step
                number="03"
                title="Secure Dispatch"
                text="Your jewellery will be packed safely and prepared for delivery."
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-4 text-sm font-bold text-white transition hover:bg-vjj-bronze"
            >
              My Orders
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-4 text-sm font-bold text-vjj-black transition hover:bg-vjj-ivory"
            >
              <ShoppingBag size={17} />
              Continue Shopping
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-4 text-sm font-bold text-vjj-black transition hover:bg-vjj-ivory"
            >
              <Home size={17} />
              Back Home
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-vjj-ivory p-5">
      <div className="text-vjj-bronze">{icon}</div>

      <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-stone-500">
        {label}
      </p>

      <p className="mt-2 font-bold capitalize text-vjj-black">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="border-b border-black/10 pb-3 last:border-b-0 last:pb-0">
      <p className="text-stone-500">{label}</p>
      <p className="mt-1 font-semibold text-vjj-black">
        {value || "Not available"}
      </p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-vjj-ivory p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-vjj-black text-xs font-bold text-vjj-champagne">
        {number}
      </div>

      <div>
        <p className="font-bold text-vjj-black">{title}</p>
        <p className="mt-1 text-sm leading-6 text-stone-600">{text}</p>
      </div>
    </div>
  );
}
