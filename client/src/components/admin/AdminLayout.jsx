import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Boxes,
  CircleHelp,
  Gem,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Store,
  Users,
  ReceiptText,
  FileText,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

import { logout } from "../../features/auth/authSlice";

const navigationItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Billing", to: "/admin/billing", icon: ReceiptText },
  { label: "Invoices", to: "/admin/invoices", icon: FileText },
  { label: "Market Rates", to: "/admin/market-rates", icon: Gem },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Settings", to: "/admin/store-settings", icon: Settings },
  { label: "Password", to: "/admin/change-password", icon: KeyRound },
  { label: "Help", to: "/admin/help", icon: CircleHelp },
];

const getUserRole = (user) =>
  String(user?.role || "")
    .toLowerCase()
    .replace("-", "_");

const isAdminUser = (user) => {
  const role = getUserRole(user);

  return role === "admin" || role === "super_admin" || role === "superadmin";
};

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isAdminUser(user)) {
      toast.error("You do not have permission to access the admin panel.");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("vjj_token");
    localStorage.removeItem("persist:root");

    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  if (!user || !isAdminUser(user)) {
    return (
      <div className="grid min-h-screen place-items-center bg-vjj-ivory px-4">
        <div className="rounded-[2rem] border border-vjj-champagne bg-vjj-cream px-8 py-10 text-center shadow-[0_20px_70px_rgba(52,34,23,0.08)]">
          <Boxes size={30} className="mx-auto text-vjj-gold" />
          <p className="mt-4 font-serif text-2xl font-bold text-vjj-black">
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vjj-ivory text-vjj-black">
      <header className="sticky top-0 z-50 border-b border-vjj-champagne bg-vjj-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1700px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Admin Brand */}
          <Link
            to="/admin"
            className="flex min-w-[180px] shrink-0 items-center gap-3"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-vjj-espresso text-vjj-champagne shadow-[0_10px_30px_rgba(52,34,23,0.18)]">
              <Store size={21} />
            </div>

            <div className="hidden sm:block">
              <p className="font-serif text-2xl font-bold leading-none text-vjj-black">
                VJJ
                <br />
                Admin
              </p>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.24em] text-vjj-gold">
                Store Manager
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="min-w-0 flex-1 overflow-x-auto pb-1 scrollbar-thin">
            <div className="flex w-max items-center gap-2 rounded-full bg-vjj-soft p-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition ${
                        isActive
                          ? "bg-vjj-espresso text-vjj-champagne shadow-[0_8px_22px_rgba(52,34,23,0.18)]"
                          : "bg-white text-vjj-black hover:bg-vjj-champagne hover:text-vjj-espresso"
                      }`
                    }
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-2 rounded-full border border-vjj-champagne bg-white px-4 py-2.5 text-sm font-bold text-vjj-black transition hover:bg-vjj-soft md:inline-flex"
            >
              <Store size={16} />
              <span className="hidden xl:inline">View Store</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-76px)]">
        <Outlet />
      </main>
    </div>
  );
}
