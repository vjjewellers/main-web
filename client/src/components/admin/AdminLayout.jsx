import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  Home,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  if (!user) {
    return (
      <section className="mx-auto min-h-screen max-w-4xl px-5 py-20 text-center">
        <h1 className="font-serif text-5xl font-bold text-vjj-black">
          Admin Login Required
        </h1>
        <p className="mt-4 text-stone-600">
          Please login with an admin account to access this panel.
        </p>

        <Link
          to="/login"
          className="mt-8 inline-flex rounded-full bg-vjj-black px-8 py-3 text-sm font-semibold text-white hover:bg-vjj-bronze"
        >
          Login
        </Link>
      </section>
    );
  }

  if (!["admin", "super_admin"].includes(user.role)) {
    return (
      <section className="mx-auto min-h-screen max-w-4xl px-5 py-20 text-center">
        <h1 className="font-serif text-5xl font-bold text-vjj-black">
          Access Denied
        </h1>
        <p className="mt-4 text-stone-600">
          Your account does not have admin permission.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-vjj-black px-8 py-3 text-sm font-semibold text-white hover:bg-vjj-bronze"
        >
          Go Home
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f6efe2]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-black/10 bg-vjj-black text-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-vjj-champagne">
                Admin Panel
              </p>
              <h1 className="mt-2 font-serif text-3xl font-bold">VJJ Shop</h1>
            </div>

            <nav className="flex-1 space-y-2 p-4">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/admin"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-vjj-champagne text-black"
                          : "text-stone-300 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="space-y-2 border-t border-white/10 p-4">
              <Link
                to="/"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-300 transition hover:bg-white/10 hover:text-white"
              >
                <Home size={18} />
                Website
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 hover:text-red-100"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="sticky top-0 z-30 border-b border-black/10 bg-[#f6efe2]/90 px-5 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between">
              <Link to="/admin">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-vjj-bronze">
                  Admin
                </p>
                <h1 className="font-serif text-2xl font-bold">VJJ Shop</h1>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-full border border-black/10 bg-white p-2"
              >
                <LogOut size={18} />
              </button>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/admin"}
                    className={({ isActive }) =>
                      `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                        isActive
                          ? "bg-vjj-black text-white"
                          : "bg-white text-vjj-black"
                      }`
                    }
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </section>
  );
}
