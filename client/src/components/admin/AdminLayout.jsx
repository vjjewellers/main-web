import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  KeyRound,
  Store,
  LogOut,
  Home,
} from "lucide-react";
import toast from "react-hot-toast";

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
  {
    label: "Password",
    href: "/admin/change-password",
    icon: KeyRound,
  },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    user?.role === "superadmin";

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (!user) {
    return (
      <section className="grid min-h-screen place-items-center bg-vjj-ivory px-5">
        <div className="max-w-md rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-luxury">
          <h1 className="font-serif text-4xl font-bold text-vjj-black">
            Login Required
          </h1>

          <p className="mt-3 text-stone-600">
            Please login with an admin account to access the admin panel.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex rounded-full bg-vjj-black px-7 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze"
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="grid min-h-screen place-items-center bg-vjj-ivory px-5">
        <div className="max-w-md rounded-[2rem] border border-black/10 bg-white p-8 text-center shadow-luxury">
          <h1 className="font-serif text-4xl font-bold text-vjj-black">
            Access Denied
          </h1>

          <p className="mt-3 text-stone-600">
            Your account does not have permission to access the admin panel.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-vjj-black px-7 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze"
          >
            Back to Store
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-vjj-ivory">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-vjj-ivory/90 px-5 py-4 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-vjj-black text-vjj-champagne shadow-glow">
                <Store size={22} />
              </div>

              <div>
                <p className="font-serif text-2xl font-bold leading-none text-vjj-black">
                  VJJ Admin
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-vjj-bronze">
                  Store Manager
                </p>
              </div>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-vjj-black transition hover:bg-vjj-black hover:text-white lg:hidden"
            >
              <Home size={16} />
              Store
            </Link>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/admin"}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-vjj-black text-white"
                        : "bg-white text-vjj-black hover:bg-vjj-black hover:text-white"
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-vjj-black transition hover:bg-vjj-black hover:text-white lg:inline-flex"
            >
              <Home size={16} />
              View Store
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl">
        <Outlet />
      </main>
    </section>
  );
}
