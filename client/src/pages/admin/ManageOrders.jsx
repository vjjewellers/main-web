import { useEffect, useState } from "react";
import {
  RefreshCcw,
  ShoppingBag,
  Truck,
  PackageCheck,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const orderStatuses = [
  "placed",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = ["pending", "paid", "failed", "refunded"];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const params = {};

      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;

      const { data } = await api.get("/admin/orders", {
        params,
      });

      setOrders(data.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, paymentFilter]);

  const handleStatusChange = async (orderId, field, value) => {
    try {
      setUpdatingId(orderId);

      const payload = {};

      if (field === "orderStatus") payload.orderStatus = value;
      if (field === "paymentStatus") payload.paymentStatus = value;

      await api.patch(`/admin/orders/${orderId}/status`, payload);

      toast.success("Order updated");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTrackingUpdate = async (orderId, formData) => {
    try {
      setUpdatingId(orderId);

      await api.patch(`/admin/orders/${orderId}/status`, formData);

      toast.success("Shipping details updated");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Shipping update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            Admin Orders
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
            Manage Orders
          </h1>
          <p className="mt-3 max-w-2xl text-stone-600">
            View customer orders, update payment status, order status and
            shipping tracking details.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm md:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl bg-vjj-ivory px-4 py-3">
          <Search size={18} className="text-vjj-bronze" />
          <span className="text-sm font-semibold text-stone-700">
            Filter Orders
          </span>
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-2xl border border-black/10 px-5 py-3 text-sm outline-none focus:border-vjj-gold"
        >
          <option value="">All Order Status</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {status.toUpperCase()}
            </option>
          ))}
        </select>

        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
          className="rounded-2xl border border-black/10 px-5 py-3 text-sm outline-none focus:border-vjj-gold"
        >
          <option value="">All Payment Status</option>
          {paymentStatuses.map((status) => (
            <option key={status} value={status}>
              {status.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold">Orders</h2>
            <p className="mt-1 text-sm text-stone-600">
              Total orders: {orders.length}
            </p>
          </div>

          <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
            <ShoppingBag />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-3xl bg-vjj-ivory"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-vjj-ivory p-10 text-center">
            <h3 className="font-serif text-2xl font-bold">No orders found</h3>
            <p className="mt-2 text-stone-600">
              Customer orders will appear here after checkout.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                updatingId={updatingId}
                onStatusChange={handleStatusChange}
                onTrackingUpdate={handleTrackingUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, updatingId, onStatusChange, onTrackingUpdate }) {
  const [courierName, setCourierName] = useState(
    order.shipping?.courierName || "",
  );
  const [trackingNumber, setTrackingNumber] = useState(
    order.shipping?.trackingNumber || "",
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.shipping?.estimatedDelivery
      ? order.shipping.estimatedDelivery.slice(0, 10)
      : "",
  );

  const isUpdating = updatingId === order._id;

  const handleSubmitTracking = (event) => {
    event.preventDefault();

    onTrackingUpdate(order._id, {
      courierName,
      trackingNumber,
      estimatedDelivery,
    });
  };

  return (
    <article className="rounded-[2rem] border border-black/10 bg-vjj-ivory p-5">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-vjj-bronze">
            {order.orderNumber}
          </p>

          <h3 className="mt-2 font-serif text-3xl font-bold text-vjj-black">
            {formatCurrency(order.totalAmount)}
          </h3>

          <p className="mt-1 text-sm text-stone-600">
            Ordered on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>

          <div className="mt-4 grid gap-1 text-sm text-stone-700">
            <p>
              <strong>Customer:</strong> {order.user?.name || "Unknown"}
            </p>
            <p>
              <strong>Email:</strong> {order.user?.email || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              {order.user?.phone || order.shippingAddress?.phone || "N/A"}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:w-[420px]">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
              Order Status
            </label>
            <select
              value={order.orderStatus}
              disabled={isUpdating}
              onChange={(event) =>
                onStatusChange(order._id, "orderStatus", event.target.value)
              }
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold outline-none"
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
              Payment
            </label>
            <select
              value={order.payment?.status || "pending"}
              disabled={isUpdating}
              onChange={(event) =>
                onStatusChange(order._id, "paymentStatus", event.target.value)
              }
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold outline-none"
            >
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-3xl bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <PackageCheck size={18} className="text-vjj-bronze" />
            <h4 className="font-serif text-xl font-bold">Items</h4>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-2xl border border-black/10 p-3"
              >
                <img
                  src={`${item.image}?auto=format&fit=crop&w=180&q=90`}
                  alt={item.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />

                <div className="min-w-0">
                  <h5 className="line-clamp-1 font-serif font-bold">
                    {item.name}
                  </h5>
                  <p className="mt-1 text-xs text-stone-500">SKU: {item.sku}</p>
                  <p className="mt-1 text-sm font-bold">
                    {formatCurrency(item.price)} × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-vjj-ivory p-4 text-sm leading-7 text-stone-700">
            <p>
              <strong>Delivery:</strong> {order.shippingAddress?.line1},{" "}
              {order.shippingAddress?.line2} {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmitTracking}
          className="rounded-3xl bg-white p-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <Truck size={18} className="text-vjj-bronze" />
            <h4 className="font-serif text-xl font-bold">Shipping</h4>
          </div>

          <div className="grid gap-3">
            <input
              value={courierName}
              onChange={(event) => setCourierName(event.target.value)}
              placeholder="Courier name"
              className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-vjj-gold"
            />

            <input
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="Tracking number"
              className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-vjj-gold"
            />

            <input
              value={estimatedDelivery}
              onChange={(event) => setEstimatedDelivery(event.target.value)}
              type="date"
              className="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-vjj-gold"
            />

            <button
              disabled={isUpdating}
              className="rounded-full bg-vjj-black px-5 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? "Updating..." : "Update Shipping"}
            </button>
          </div>
        </form>
      </div>
    </article>
  );
}
