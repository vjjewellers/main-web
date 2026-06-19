import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Box,
  Calendar,
  Eye,
  Home,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";

const getOrderItems = (order) => order?.items || order?.orderItems || [];

const getOrderNumber = (order) =>
  order?.orderNumber || order?._id || order?.id || "Order";

const getOrderStatus = (order) =>
  String(order?.orderStatus || order?.status || "placed").toLowerCase();

const getPaymentStatus = (order) =>
  String(order?.paymentStatus || "pending").toLowerCase();

const getOrderTotal = (order) =>
  Number(order?.totalAmount || order?.total || order?.grandTotal || 0);

const getCustomerName = (order, user) =>
  order?.shippingAddress?.fullName || user?.name || "Customer";

const getAddressText = (order) => {
  const address = order?.shippingAddress || {};

  return [
    address.addressLine1 || address.line1,
    address.addressLine2 || address.line2,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const statusStyle = {
  placed: "bg-vjj-soft text-vjj-bronze border-vjj-champagne",
  confirmed: "bg-amber-50 text-amber-700 border-amber-100",
  processing: "bg-purple-50 text-purple-700 border-purple-100",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-100",
  delivered: "bg-green-50 text-green-700 border-green-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  paid: "bg-green-50 text-green-700 border-green-100",
  failed: "bg-red-50 text-red-700 border-red-100",
  refunded: "bg-stone-50 text-stone-700 border-stone-100",
};

const getStatusClass = (status) =>
  statusStyle[String(status || "").toLowerCase()] ||
  "bg-stone-50 text-stone-700 border-stone-100";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/orders/my-orders");

      setOrders(data.orders || data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        state: {
          from: "/dashboard",
        },
      });
      return;
    }

    fetchOrders();
  }, [user]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const activeOrders = orders.filter((order) =>
      ["placed", "confirmed", "processing", "shipped"].includes(
        getOrderStatus(order),
      ),
    ).length;

    const deliveredOrders = orders.filter(
      (order) => getOrderStatus(order) === "delivered",
    ).length;

    const totalSpent = orders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0,
    );

    return {
      totalOrders,
      activeOrders,
      deliveredOrders,
      totalSpent,
    };
  }, [orders]);

  if (!user) {
    return null;
  }

  return (
    <section className="bg-vjj-ivory px-5 py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[2rem] bg-vjj-black p-6 text-white shadow-luxury md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-champagne">
                My Account
              </p>

              <h1 className="mt-3 font-serif text-5xl font-bold">
                Welcome, {user?.name || "Customer"}
              </h1>

              <p className="mt-3 max-w-2xl text-stone-300">
                Track your jewellery orders, view payment status and see your
                delivery details.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-champagne px-6 py-3 text-sm font-bold text-vjj-black transition hover:bg-vjj-gold"
            >
              Continue Shopping
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingBag />}
          />

          <StatCard
            label="Active Orders"
            value={stats.activeOrders}
            icon={<Truck />}
          />

          <StatCard
            label="Delivered"
            value={stats.deliveredOrders}
            icon={<PackageCheck />}
          />

          <StatCard
            label="Total Spent"
            value={formatCurrency(stats.totalSpent)}
            icon={<Box />}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
                  <User />
                </div>

                <div>
                  <h2 className="font-serif text-3xl font-bold text-vjj-black">
                    Profile
                  </h2>
                  <p className="text-sm text-stone-600">
                    Your account information
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <InfoRow
                  icon={<User size={17} />}
                  label={user?.name || "N/A"}
                />
                <InfoRow
                  icon={<Mail size={17} />}
                  label={user?.email || "N/A"}
                />
                <InfoRow
                  icon={<Phone size={17} />}
                  label={user?.phone || "Phone not added"}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-3xl font-bold text-vjj-black">
                Quick Links
              </h2>

              <div className="mt-5 grid gap-3">
                <Link
                  to="/products"
                  className="flex items-center justify-between rounded-2xl bg-vjj-ivory px-4 py-3 font-semibold text-vjj-black transition hover:bg-vjj-black hover:text-white"
                >
                  Shop Products
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center justify-between rounded-2xl bg-vjj-ivory px-4 py-3 font-semibold text-vjj-black transition hover:bg-vjj-black hover:text-white"
                >
                  My Wishlist
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/cart"
                  className="flex items-center justify-between rounded-2xl bg-vjj-ivory px-4 py-3 font-semibold text-vjj-black transition hover:bg-vjj-black hover:text-white"
                >
                  My Cart
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/"
                  className="flex items-center justify-between rounded-2xl bg-vjj-ivory px-4 py-3 font-semibold text-vjj-black transition hover:bg-vjj-black hover:text-white"
                >
                  Home
                  <Home size={17} />
                </Link>
              </div>
            </div>
          </aside>

          <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="font-serif text-4xl font-bold text-vjj-black">
                  My Orders
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  View your order history and current status.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchOrders}
                className="rounded-full bg-vjj-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-vjj-bronze"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-32 animate-pulse rounded-3xl bg-vjj-ivory"
                  />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-3xl bg-vjj-ivory p-8 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-vjj-bronze">
                  <ShoppingBag />
                </div>

                <h3 className="mt-4 font-serif text-3xl font-bold text-vjj-black">
                  No orders yet
                </h3>

                <p className="mt-2 text-stone-600">
                  Start shopping and your orders will appear here.
                </p>

                <Link
                  to="/products"
                  className="mt-6 inline-flex rounded-full bg-vjj-black px-6 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => {
                  const orderStatus = getOrderStatus(order);
                  const paymentStatus = getPaymentStatus(order);
                  const items = getOrderItems(order);

                  return (
                    <div
                      key={order._id}
                      className="rounded-3xl border border-black/10 bg-vjj-ivory p-4"
                    >
                      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-2xl font-bold text-vjj-black">
                              {getOrderNumber(order)}
                            </h3>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                                orderStatus,
                              )}`}
                            >
                              {orderStatus}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                                paymentStatus,
                              )}`}
                            >
                              {paymentStatus}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-stone-600 md:grid-cols-3">
                            <p>
                              <strong className="text-vjj-black">Items:</strong>{" "}
                              {items.length}
                            </p>

                            <p>
                              <strong className="text-vjj-black">Total:</strong>{" "}
                              {formatCurrency(getOrderTotal(order))}
                            </p>

                            <p>
                              <strong className="text-vjj-black">Date:</strong>{" "}
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString(
                                    "en-IN",
                                  )
                                : ""}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-5 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze"
                        >
                          <Eye size={17} />
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          user={user}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
            {label}
          </p>
          <p className="mt-3 font-serif text-3xl font-bold text-vjj-black">
            {value}
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
          {icon}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-vjj-ivory p-3">
      <span className="shrink-0 text-vjj-bronze">{icon}</span>
      <span className="break-words text-sm text-stone-700">{label}</span>
    </div>
  );
}

function OrderDetailsModal({ order, user, onClose }) {
  const items = getOrderItems(order);
  const orderStatus = getOrderStatus(order);
  const paymentStatus = getPaymentStatus(order);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 px-5 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
              Order Details
            </p>

            <h2 className="mt-2 font-serif text-4xl font-bold text-vjj-black">
              {getOrderNumber(order)}
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN")
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 p-2 transition hover:bg-vjj-ivory"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatusBox label="Order Status" value={orderStatus} />
          <StatusBox label="Payment Status" value={paymentStatus} />
          <StatusBox
            label="Order Total"
            value={formatCurrency(getOrderTotal(order))}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.5rem] border border-black/10 bg-vjj-ivory p-5">
            <h3 className="font-serif text-2xl font-bold text-vjj-black">
              Items Ordered
            </h3>

            <div className="mt-4 space-y-3">
              {items.map((item, index) => {
                const product = item.product || item;

                const image =
                  item.image ||
                  product.image ||
                  product.images?.find((img) => img.isPrimary)?.url ||
                  product.images?.[0]?.url ||
                  "";

                const name = item.name || product.name || "Product";
                const sku = item.sku || product.sku || "";
                const quantity = Number(item.quantity || 1);
                const price = Number(item.price || product.price || 0);

                return (
                  <div
                    key={item._id || `${name}-${index}`}
                    className="flex gap-4 rounded-2xl border border-black/10 bg-white p-3"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-vjj-ivory">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center">
                          <PackageCheck className="text-vjj-bronze" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-vjj-black">{name}</p>

                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-stone-500">
                        {sku && <span>SKU: {sku}</span>}
                        <span>Qty: {quantity}</span>
                        {item.selectedSize && (
                          <span>Size: {item.selectedSize}</span>
                        )}
                        {item.selectedMaterial && (
                          <span>{item.selectedMaterial}</span>
                        )}
                      </div>

                      <p className="mt-3 font-bold text-vjj-black">
                        {formatCurrency(price * quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.5rem] border border-black/10 bg-white p-5">
              <h3 className="font-serif text-2xl font-bold text-vjj-black">
                Delivery Details
              </h3>

              <div className="mt-4 space-y-3">
                <InfoRow
                  icon={<User size={17} />}
                  label={getCustomerName(order, user)}
                />

                <InfoRow
                  icon={<Phone size={17} />}
                  label={order?.shippingAddress?.phone || user?.phone || "N/A"}
                />

                <InfoRow
                  icon={<Mail size={17} />}
                  label={order?.shippingAddress?.email || user?.email || "N/A"}
                />

                <InfoRow
                  icon={<MapPin size={17} />}
                  label={getAddressText(order) || "N/A"}
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-black/10 bg-vjj-black p-5 text-white">
              <h3 className="font-serif text-2xl font-bold">Tracking</h3>

              <div className="mt-5 space-y-4">
                <TrackingStep
                  active
                  title="Order Placed"
                  text="Your order has been placed successfully."
                />

                <TrackingStep
                  active={[
                    "confirmed",
                    "processing",
                    "shipped",
                    "delivered",
                  ].includes(orderStatus)}
                  title="Confirmed"
                  text="Store team has confirmed your order."
                />

                <TrackingStep
                  active={["processing", "shipped", "delivered"].includes(
                    orderStatus,
                  )}
                  title="Processing"
                  text="Your jewellery is being prepared."
                />

                <TrackingStep
                  active={["shipped", "delivered"].includes(orderStatus)}
                  title="Shipped"
                  text="Your order is on the way."
                />

                <TrackingStep
                  active={orderStatus === "delivered"}
                  title="Delivered"
                  text="Order delivered successfully."
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatusBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-vjj-ivory p-4">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl font-bold capitalize text-vjj-black">
        {value}
      </p>
    </div>
  );
}

function TrackingStep({ active, title, text }) {
  return (
    <div className="flex gap-3">
      <div
        className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${
          active
            ? "border-vjj-champagne bg-vjj-champagne"
            : "border-white/30 bg-transparent"
        }`}
      />

      <div>
        <p
          className={`font-bold ${
            active ? "text-vjj-champagne" : "text-stone-400"
          }`}
        >
          {title}
        </p>
        <p className="mt-1 text-sm text-stone-300">{text}</p>
      </div>
    </div>
  );
}
