import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  Home as HomeIcon,
  LogOut,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { logout } from "../../features/auth/authSlice";
import { selectCartCount } from "../../features/cart/cartSlice";
import { selectWishlistCount } from "../../features/wishlist/wishlistSlice";
import { BRAND } from "../../utils/constants";

const navLinks = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Products", href: "/products", icon: Package },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "My Orders", href: "/dashboard", icon: User },
];

const isAdminUser = (user) => {
  const role = String(user?.role || "").toLowerCase();
  return role === "admin" || role === "super_admin" || role === "superadmin";
};

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) {
      navigate("/products");
      setMobileOpen(false);
      return;
    }

    navigate(`/products?search=${encodeURIComponent(query)}`);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("vjj_token");
    toast.success("Logged out successfully");
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-blue-100/70 bg-white/95 px-4 py-3 transition-all duration-300 sm:px-5 lg:px-8 ${
          scrolled ? "shadow-[0_14px_40px_rgba(15,23,42,0.08)]" : ""
        }`}
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/20 sm:h-12 sm:w-12">
                <Sparkles size={22} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-serif text-xl font-bold leading-none text-slate-950 sm:text-2xl">
                  {BRAND.displayName}
                </p>
                <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 sm:text-[11px]">
                  Verma ji jewellers
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-blue-100 bg-blue-50/70 p-1 lg:flex">
              {navLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/"}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "text-slate-700 hover:bg-white hover:text-blue-700"
                      }`
                    }
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}

              {isAdminUser(user) && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                      isActive
                        ? "bg-slate-950 text-white"
                        : "text-slate-700 hover:bg-white hover:text-slate-950"
                    }`
                  }
                >
                  <ShieldCheck size={16} />
                  Admin
                </NavLink>
              )}
            </nav>

            <form
              onSubmit={handleSearch}
              className="hidden min-w-[230px] items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-4 py-2.5 xl:flex"
            >
              <Search size={17} className="text-slate-400" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search jewellery..."
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
            </form>

            <div className="flex items-center gap-2">
              <Link
                to="/wishlist"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-blue-50 text-slate-900 transition hover:bg-blue-600 hover:text-white sm:h-11 sm:w-11"
                aria-label="Wishlist"
              >
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-blue-50 text-slate-900 transition hover:bg-blue-600 hover:text-white sm:h-11 sm:w-11"
                aria-label="Cart"
              >
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 md:inline-flex"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="hidden rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 md:inline-flex"
                >
                  Login
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-blue-600 text-white shadow-md shadow-blue-500/20 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/45"
          />

          <aside className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white">
                    <Sparkles size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-serif text-2xl font-bold text-slate-950">
                      {BRAND.displayName}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                      Jewellery Store
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-950 shadow-sm"
                >
                  <X size={21} />
                </button>
              </div>

              {user ? (
                <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4">
                  <p className="text-sm font-bold text-slate-950">
                    {user.name || "User"}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white"
                >
                  Login / Register
                </Link>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <Search size={17} className="text-slate-400" />
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search jewellery..."
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </form>

              <div className="mt-6 grid gap-2">
                {navLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      end={item.href === "/"}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-bold transition ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-slate-50 text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                        }`
                      }
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={19} />
                        {item.label}
                      </span>

                      {item.href === "/wishlist" && wishlistCount > 0 && (
                        <span className="rounded-full bg-white/20 px-2 py-1 text-xs">
                          {wishlistCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}

                <NavLink
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-bold transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-50 text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag size={19} />
                    Cart
                  </span>

                  {cartCount > 0 && (
                    <span className="rounded-full bg-white/20 px-2 py-1 text-xs">
                      {cartCount}
                    </span>
                  )}
                </NavLink>

                {isAdminUser(user) && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold transition ${
                        isActive
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                      }`
                    }
                  >
                    <ShieldCheck size={19} />
                    Admin Panel
                  </NavLink>
                )}
              </div>
            </div>

            <div className="border-t border-blue-100 p-5">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              ) : (
                <p className="text-center text-xs leading-5 text-slate-500">
                  Login to save wishlist, cart and view your order history.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
