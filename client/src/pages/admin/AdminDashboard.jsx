import { useEffect, useState } from "react";
import {
  IndianRupee,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
} from "lucide-react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data.stats);
    } catch (error) {
      console.error("Admin stats error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: IndianRupee,
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
    },
    {
      label: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
    },
  ];

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
          Admin Overview
        </p>
        <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
          Dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Track orders, revenue, inventory and customer activity for VJJ Shop.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-[2rem] bg-white"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
                    <Icon />
                  </div>

                  <p className="text-sm text-stone-500">{card.label}</p>
                  <h2 className="mt-2 text-3xl font-bold text-vjj-black">
                    {card.value}
                  </h2>
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-bold">
                    Pending Orders
                  </h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Orders that need processing or shipping.
                  </p>
                </div>

                <span className="rounded-full bg-vjj-black px-5 py-2 text-sm font-bold text-white">
                  {stats?.pendingOrders || 0}
                </span>
              </div>

              <div className="rounded-3xl bg-vjj-ivory p-6">
                <p className="text-sm leading-7 text-stone-700">
                  Use the Orders section to confirm orders, add courier details,
                  update tracking number, and mark orders as shipped or
                  delivered.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle />
                </div>

                <div>
                  <h2 className="font-serif text-3xl font-bold">Low Stock</h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Products with stock 5 or less.
                  </p>
                </div>
              </div>

              {stats?.lowStockProducts?.length === 0 ? (
                <div className="rounded-3xl bg-green-50 p-6 text-green-700">
                  All products have healthy stock.
                </div>
              ) : (
                <div className="grid gap-3">
                  {stats?.lowStockProducts?.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between rounded-2xl bg-vjj-ivory p-4"
                    >
                      <div>
                        <h3 className="font-serif text-lg font-bold">
                          {product.name}
                        </h3>
                        <p className="text-xs text-stone-500">
                          SKU: {product.sku}
                        </p>
                      </div>

                      <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
                        {product.stock}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
