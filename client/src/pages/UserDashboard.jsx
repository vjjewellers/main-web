import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Package, UserRound, MapPin } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import api from "../services/api";
import { logout } from "../features/auth/authSlice";
import { formatCurrency } from "../utils/formatCurrency";

export default function UserDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Order fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <section className="mx-auto min-h-screen max-w-7xl px-5 py-14">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            My Account
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
            Welcome, {user.name}
          </h1>
          <p className="mt-3 text-stone-600">{user.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
            <UserRound />
          </div>
          <h2 className="font-serif text-2xl font-bold">Profile</h2>
          <p className="mt-2 text-sm text-stone-600">Name: {user.name}</p>
          <p className="mt-1 text-sm text-stone-600">Email: {user.email}</p>
          <p className="mt-1 text-sm text-stone-600">
            Phone: {user.phone || "Not added"}
          </p>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
            <Package />
          </div>
          <h2 className="font-serif text-2xl font-bold">Orders</h2>
          <p className="mt-2 text-sm text-stone-600">
            Total orders: {orders.length}
          </p>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
            <MapPin />
          </div>
          <h2 className="font-serif text-2xl font-bold">Addresses</h2>
          <p className="mt-2 text-sm text-stone-600">
            Saved addresses: {user.addresses?.length || 0}
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-3xl font-bold">My Orders</h2>

          <Link
            to="/products"
            className="rounded-full bg-vjj-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-vjj-bronze"
          >
            Shop More
          </Link>
        </div>

        {loading ? (
          <p className="text-stone-600">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-vjj-ivory p-8 text-center">
            <h3 className="font-serif text-2xl font-bold">No orders yet</h3>
            <p className="mt-2 text-stone-600">
              Start shopping and your orders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl border border-black/10 bg-vjj-ivory p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-vjj-bronze">
                      {order.orderNumber}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-bold">
                      {formatCurrency(order.totalAmount)}
                    </h3>
                    <p className="mt-1 text-sm text-stone-600">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-vjj-bronze">
                      {order.orderStatus}
                    </span>

                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-vjj-bronze">
                      {order.payment?.status}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {order.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-2xl bg-white p-3"
                    >
                      <img
                        src={`${item.image}?auto=format&fit=crop&w=180&q=90`}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />

                      <div>
                        <h4 className="line-clamp-1 font-serif font-bold">
                          {item.name}
                        </h4>
                        <p className="mt-1 text-sm text-stone-600">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-bold">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
