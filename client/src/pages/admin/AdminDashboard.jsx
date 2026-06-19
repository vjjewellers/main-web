import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  IndianRupee,
  Package,
  PackageCheck,
  RefreshCcw,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  Plus,
  Eye,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

const getOrderStatus = (order) =>
  String(order?.orderStatus || order?.status || "placed").toLowerCase();

const getPaymentStatus = (order) =>
  String(order?.paymentStatus || "pending").toLowerCase();

const getOrderTotal = (order) =>
  Number(order?.totalAmount || order?.total || order?.grandTotal || 0);

const getOrderNumber = (order) => order?.orderNumber || order?._id || "Order";

const getCustomerName = (order) =>
  order?.shippingAddress?.fullName ||
  order?.user?.name ||
  order?.customerName ||
  "Customer";

const getProductImage = (product) =>
  product?.images?.find((image) => image.isPrimary)?.url ||
  product?.images?.[0]?.url ||
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=90";

const statusStyle = {
  placed: "bg-vjj-soft text-vjj-bronze",
  confirmed: "bg-amber-50 text-amber-700",
  processing: "bg-purple-50 text-purple-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
};

const getStatusClass = (status) =>
  statusStyle[String(status || "").toLowerCase()] ||
  "bg-stone-50 text-stone-700";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, ordersRes, productsRes, usersRes] =
        await Promise.allSettled([
          api.get("/admin/stats"),
          api.get("/admin/orders"),
          api.get("/products", {
            params: {
              limit: 100,
            },
          }),
          api.get("/admin/users"),
        ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data || null);
      }

      if (ordersRes.status === "fulfilled") {
        const data = ordersRes.value.data;
        setOrders(data.orders || data || []);
      }

      if (productsRes.status === "fulfilled") {
        const data = productsRes.value.data;
        setProducts(data.products || data || []);
      }

      if (usersRes.status === "fulfilled") {
        const data = usersRes.value.data;
        setUsers(data.users || data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const dashboardStats = useMemo(() => {
    const totalRevenueFromOrders = orders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0,
    );

    const deliveredOrders = orders.filter(
      (order) => getOrderStatus(order) === "delivered",
    );

    const pendingOrders = orders.filter((order) =>
      ["placed", "confirmed", "processing"].includes(getOrderStatus(order)),
    );

    const paidOrders = orders.filter(
      (order) => getPaymentStatus(order) === "paid",
    );

    return {
      totalRevenue:
        stats?.totalRevenue ||
        stats?.revenue ||
        stats?.data?.totalRevenue ||
        totalRevenueFromOrders,
      totalOrders:
        stats?.totalOrders ||
        stats?.orders ||
        stats?.data?.totalOrders ||
        orders.length,
      totalProducts:
        stats?.totalProducts ||
        stats?.products ||
        stats?.data?.totalProducts ||
        products.length,
      totalUsers:
        stats?.totalUsers ||
        stats?.users ||
        stats?.data?.totalUsers ||
        users.length,
      pendingOrders: pendingOrders.length,
      deliveredOrders: deliveredOrders.length,
      paidOrders: paidOrders.length,
    };
  }, [stats, orders, products, users]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return [...products]
      .filter((product) => Number(product.stock || 0) <= 5)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
      .slice(0, 6);
  }, [products]);

  const featuredProducts = useMemo(() => {
    return products.filter((product) => product.isFeatured).slice(0, 4);
  }, [products]);

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            Admin Dashboard
          </p>

          <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
            Store Overview
          </h1>

          <p className="mt-3 max-w-2xl text-stone-600">
            Track products, orders, customers, revenue and important store
            activities from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(dashboardStats.totalRevenue)}
              subtitle="All order value"
              icon={<IndianRupee />}
              dark
            />

            <MetricCard
              title="Total Orders"
              value={dashboardStats.totalOrders}
              subtitle={`${dashboardStats.pendingOrders} active orders`}
              icon={<ShoppingBag />}
            />

            <MetricCard
              title="Products"
              value={dashboardStats.totalProducts}
              subtitle={`${lowStockProducts.length} low stock alerts`}
              icon={<Package />}
            />

            <MetricCard
              title="Customers"
              value={dashboardStats.totalUsers}
              subtitle="Registered users"
              icon={<Users />}
            />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <QuickAction
              to="/admin/products"
              icon={<Plus />}
              title="Add Product"
              text="Create new jewellery listing"
            />

            <QuickAction
              to="/admin/orders"
              icon={<PackageCheck />}
              title="Manage Orders"
              text="Update status and print slips"
            />

            <QuickAction
              to="/"
              icon={<Eye />}
              title="View Store"
              text="Open public website"
            />
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-vjj-black">
                    Recent Orders
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Latest customer orders from website checkout.
                  </p>
                </div>

                <Link
                  to="/admin/orders"
                  className="inline-flex items-center gap-2 rounded-full bg-vjj-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-vjj-bronze"
                >
                  View All
                  <ArrowRight size={16} />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag />}
                  title="No orders yet"
                  text="Customer orders will appear here."
                />
              ) : (
                <div className="grid gap-4">
                  {recentOrders.map((order) => {
                    const orderStatus = getOrderStatus(order);
                    const paymentStatus = getPaymentStatus(order);

                    return (
                      <div
                        key={order._id}
                        className="rounded-3xl border border-black/10 bg-vjj-ivory p-4"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-serif text-2xl font-bold text-vjj-black">
                                {getOrderNumber(order)}
                              </h3>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                                  orderStatus,
                                )}`}
                              >
                                {orderStatus}
                              </span>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                                  paymentStatus,
                                )}`}
                              >
                                {paymentStatus}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-stone-600">
                              {getCustomerName(order)} ·{" "}
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString(
                                    "en-IN",
                                  )
                                : ""}
                            </p>
                          </div>

                          <div className="text-left md:text-right">
                            <p className="text-sm text-stone-500">Total</p>
                            <p className="font-serif text-2xl font-bold text-vjj-black">
                              {formatCurrency(getOrderTotal(order))}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-vjj-black">
                    Low Stock Alerts
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Products with stock 5 or below.
                  </p>
                </div>

                <div className="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle />
                </div>
              </div>

              {lowStockProducts.length === 0 ? (
                <EmptyState
                  icon={<Boxes />}
                  title="Stock looks good"
                  text="No low-stock products right now."
                />
              ) : (
                <div className="grid gap-4">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex gap-4 rounded-3xl border border-black/10 bg-vjj-ivory p-3"
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 font-serif text-xl font-bold text-vjj-black">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-stone-500">
                          SKU: {product.sku}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              Number(product.stock || 0) === 0
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            Stock: {product.stock}
                          </span>

                          <Link
                            to="/admin/products"
                            className="text-xs font-bold text-vjj-bronze hover:underline"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[2rem] border border-black/10 bg-vjj-black p-6 text-white shadow-luxury">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-champagne">
                Performance
              </p>

              <h2 className="mt-3 font-serif text-4xl font-bold">
                Order Snapshot
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <DarkMiniCard
                  label="Active"
                  value={dashboardStats.pendingOrders}
                  icon={<Clock />}
                />
                <DarkMiniCard
                  label="Delivered"
                  value={dashboardStats.deliveredOrders}
                  icon={<PackageCheck />}
                />
                <DarkMiniCard
                  label="Paid"
                  value={dashboardStats.paidOrders}
                  icon={<TrendingUp />}
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-vjj-black">
                    Featured Products
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Signature products currently marked featured.
                  </p>
                </div>

                <Link
                  to="/admin/products"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
                >
                  Manage
                  <ArrowRight size={16} />
                </Link>
              </div>

              {featuredProducts.length === 0 ? (
                <EmptyState
                  icon={<Package />}
                  title="No featured products"
                  text="Mark products as featured from product manager."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {featuredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="rounded-3xl border border-black/10 bg-vjj-ivory p-3"
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="h-36 w-full rounded-2xl object-cover"
                      />

                      <p className="mt-3 line-clamp-1 font-serif text-xl font-bold text-vjj-black">
                        {product.name}
                      </p>

                      <p className="mt-1 text-sm font-bold text-vjj-bronze">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, dark = false }) {
  return (
    <div
      className={`rounded-[2rem] border p-6 shadow-sm ${
        dark
          ? "border-vjj-black bg-vjj-black text-white"
          : "border-black/10 bg-white text-vjj-black"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-[0.22em] ${
              dark ? "text-vjj-champagne" : "text-stone-400"
            }`}
          >
            {title}
          </p>

          <p className="mt-4 font-serif text-4xl font-bold">{value}</p>

          <p
            className={`mt-2 text-sm ${dark ? "text-stone-300" : "text-stone-500"}`}
          >
            {subtitle}
          </p>
        </div>

        <div
          className={`grid h-12 w-12 place-items-center rounded-full ${
            dark
              ? "bg-vjj-champagne/10 text-vjj-champagne"
              : "bg-vjj-ivory text-vjj-bronze"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon, title, text }) {
  return (
    <Link
      to={to}
      className="group rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-luxury"
    >
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze transition group-hover:bg-vjj-black group-hover:text-vjj-champagne">
          {icon}
        </div>

        <div>
          <h3 className="font-serif text-2xl font-bold text-vjj-black">
            {title}
          </h3>
          <p className="mt-1 text-sm text-stone-600">{text}</p>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="rounded-3xl bg-vjj-ivory p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-vjj-bronze">
        {icon}
      </div>

      <h3 className="mt-4 font-serif text-2xl font-bold text-vjj-black">
        {title}
      </h3>

      <p className="mt-2 text-sm text-stone-600">{text}</p>
    </div>
  );
}

function DarkMiniCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-vjj-champagne">{icon}</div>
      <p className="mt-4 text-sm text-stone-300">{label}</p>
      <p className="mt-1 font-serif text-4xl font-bold text-white">{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-[2rem] bg-white"
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-[1.5rem] bg-white"
          />
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[520px] animate-pulse rounded-[2rem] bg-white" />
        <div className="h-[520px] animate-pulse rounded-[2rem] bg-white" />
      </div>
    </div>
  );
}
