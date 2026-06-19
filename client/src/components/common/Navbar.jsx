import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  Home as HomeIcon,
  LogOut,
  Menu,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { logout } from "../../features/auth/authSlice";
import { selectWishlistCount } from "../../features/wishlist/wishlistSlice";
import { BRAND } from "../../utils/constants";

const navLinks = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Products", href: "/products", icon: Package },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "My Account", href: "/dashboard", icon: User },
];

const isAdminUser = (user) => {
  const role = String(user?.role || "").toLowerCase();
  return role === "admin" || role === "super_admin" || role === "superadmin";
};

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
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
    document.body.style.overflow = mobileOpen ? "hidden" : "";

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
        className={`sticky top-0 z-50 border-b border-vjj-champagne bg-vjj-cream/95 px-4 py-3 transition-all duration-300 sm:px-5 lg:px-8 ${
          scrolled ? "shadow-[0_14px_40px_rgba(52,34,23,0.10)]" : ""
        }`}
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex shrink-0 items-center">
              <img
                src="/logo.png"
                alt="Verma Ji Jewellers"
                className="h-12 w-auto object-contain sm:h-14 lg:h-16"
              />
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-vjj-champagne bg-vjj-soft p-1 lg:flex">
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
                          ? "bg-vjj-espresso text-vjj-champagne shadow-md shadow-vjj-gold/20"
                          : "text-vjj-coffee hover:bg-white hover:text-vjj-black"
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
                        ? "bg-vjj-black text-vjj-champagne"
                        : "text-vjj-coffee hover:bg-white hover:text-vjj-black"
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
              className="hidden min-w-[235px] items-center gap-2 rounded-full border border-vjj-champagne bg-vjj-soft px-4 py-2.5 xl:flex"
            >
              <Search size={17} className="text-vjj-coffee" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search jewellery..."
                className="w-full bg-transparent text-sm font-semibold text-vjj-black outline-none placeholder:text-vjj-coffee/70"
              />
            </form>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${BRAND.phone}`}
                className="hidden h-11 items-center justify-center gap-2 rounded-full border border-vjj-champagne bg-vjj-soft px-4 text-sm font-bold text-vjj-black transition hover:bg-vjj-gold hover:text-white md:inline-flex"
              >
                <Phone size={17} />
                Call
              </a>

              <Link
                to="/wishlist"
                className="relative grid h-10 w-10 place-items-center rounded-full border border-vjj-champagne bg-vjj-soft text-vjj-black transition hover:bg-vjj-gold hover:text-white sm:h-11 sm:w-11"
                aria-label="Wishlist"
              >
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-vjj-espresso px-1 text-[10px] font-bold text-vjj-champagne">
                    {wishlistCount}
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
                  className="hidden rounded-full bg-vjj-espresso px-5 py-2.5 text-sm font-bold text-vjj-champagne shadow-md shadow-vjj-gold/20 transition hover:bg-vjj-gold hover:text-white md:inline-flex"
                >
                  Login
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full border border-vjj-gold bg-vjj-espresso text-vjj-champagne shadow-md shadow-vjj-gold/20 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[100] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-vjj-black/65"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            />

            <motion.aside
              className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-vjj-cream shadow-2xl"
              initial={{ x: "100%", opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 310,
                damping: 32,
                mass: 0.9,
              }}
            >
              <div className="border-b border-vjj-champagne bg-gradient-to-br from-vjj-soft via-vjj-cream to-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex shrink-0 items-center"
                  >
                    <img
                      src="/logo.png"
                      alt="Verma Ji Jewellers"
                      className="h-14 w-auto object-contain"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-vjj-black shadow-sm transition hover:bg-vjj-soft"
                  >
                    <X size={21} />
                  </button>
                </div>

                {user ? (
                  <div className="mt-5 rounded-2xl border border-vjj-champagne bg-white p-4">
                    <p className="text-sm font-bold text-vjj-black">
                      {user.name || "User"}
                    </p>
                    <p className="mt-1 break-all text-xs text-vjj-coffee">
                      {user.email}
                    </p>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-vjj-espresso px-5 py-3 text-sm font-bold text-vjj-champagne transition hover:bg-vjj-gold hover:text-white"
                  >
                    Login / Register
                  </Link>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <form onSubmit={handleSearch}>
                  <div className="flex items-center gap-2 rounded-2xl border border-vjj-champagne bg-vjj-soft px-4 py-3">
                    <Search size={17} className="text-vjj-coffee" />
                    <input
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      placeholder="Search jewellery..."
                      className="w-full bg-transparent text-sm font-semibold text-vjj-black outline-none placeholder:text-vjj-coffee/70"
                    />
                  </div>
                </form>

                <motion.div
                  className="mt-6 grid gap-2"
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: {},
                    show: {
                      transition: {
                        staggerChildren: 0.045,
                        delayChildren: 0.08,
                      },
                    },
                  }}
                >
                  {navLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        key={item.href}
                        variants={{
                          hidden: { opacity: 0, x: 24 },
                          show: { opacity: 1, x: 0 },
                        }}
                        transition={{ duration: 0.22 }}
                      >
                        <NavLink
                          to={item.href}
                          end={item.href === "/"}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-bold transition ${
                              isActive
                                ? "bg-vjj-espresso text-vjj-champagne"
                                : "bg-white text-vjj-black hover:bg-vjj-soft"
                            }`
                          }
                        >
                          <span className="flex items-center gap-3">
                            <Icon size={19} />
                            {item.label}
                          </span>

                          {item.href === "/wishlist" && wishlistCount > 0 && (
                            <span className="rounded-full bg-vjj-gold px-2 py-1 text-xs text-white">
                              {wishlistCount}
                            </span>
                          )}
                        </NavLink>
                      </motion.div>
                    );
                  })}

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: 24 },
                      show: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.22 }}
                  >
                    <a
                      href={`tel:${BRAND.phone}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-sm font-bold text-vjj-black transition hover:bg-vjj-soft"
                    >
                      <Phone size={19} />
                      Call Store
                    </a>
                  </motion.div>

                  {isAdminUser(user) && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: 24 },
                        show: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.22 }}
                    >
                      <NavLink
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold transition ${
                            isActive
                              ? "bg-vjj-black text-vjj-champagne"
                              : "bg-vjj-soft text-vjj-black hover:bg-vjj-champagne"
                          }`
                        }
                      >
                        <ShieldCheck size={19} />
                        Admin Panel
                      </NavLink>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              <div className="border-t border-vjj-champagne p-5">
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
                  <p className="text-center text-xs leading-5 text-vjj-coffee">
                    Login to save wishlist and view your account details.
                  </p>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
