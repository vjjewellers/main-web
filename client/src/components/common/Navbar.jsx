import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

import { openCart, selectCartCount } from "../../features/cart/cartSlice";
import { CATEGORIES } from "../../utils/constants";

const menuVariants = {
  hidden: {
    opacity: 0,
    y: -18,
    height: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.035,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -14,
    height: 0,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: "easeOut",
    },
  },
};

export default function Navbar() {
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fbf7ef]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="group" onClick={closeMobile}>
          <p className="text-xs uppercase tracking-[0.35em] text-vjj-bronze">
            Verma ji jewellers
          </p>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-vjj-black">
            VJJ Shop
          </h1>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink to="/" className="text-sm font-medium hover:text-vjj-bronze">
            Home
          </NavLink>

          <div className="group relative">
            <NavLink
              to="/products"
              className="text-sm font-medium hover:text-vjj-bronze"
            >
              Jewellery
            </NavLink>

            <div className="invisible absolute left-1/2 top-8 w-[720px] -translate-x-1/2 rounded-3xl border border-black/10 bg-white/95 p-6 opacity-0 shadow-2xl backdrop-blur-xl transition-all group-hover:visible group-hover:top-10 group-hover:opacity-100">
              <div className="grid grid-cols-3 gap-4">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    to={`/products?category=${encodeURIComponent(category)}`}
                    className="rounded-2xl border border-stone-200 bg-vjj-ivory px-4 py-3 text-sm font-medium transition hover:border-vjj-gold hover:bg-white hover:text-vjj-bronze"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <NavLink
            to="/products?featured=true"
            className="text-sm font-medium hover:text-vjj-bronze"
          >
            Signature
          </NavLink>

          <NavLink
            to="/products?readyToShip=true"
            className="text-sm font-medium hover:text-vjj-bronze"
          >
            Ready To Ship
          </NavLink>

          <a
            href="https://maps.app.goo.gl/qPDMbrZeXN9yqtd28?g_st=iw"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium hover:text-vjj-bronze"
          >
            Store
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="hidden rounded-full border border-black/10 p-2.5 transition hover:bg-white md:inline-flex"
          >
            <Search size={18} />
          </Link>

          <button className="hidden rounded-full border border-black/10 p-2.5 transition hover:bg-white md:inline-flex">
            <Heart size={18} />
          </button>

          <Link
            to="/dashboard"
            className="hidden rounded-full border border-black/10 p-2.5 transition hover:bg-white md:inline-flex"
          >
            <User size={18} />
          </Link>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => dispatch(openCart())}
            className="relative rounded-full bg-vjj-black p-2.5 text-white transition hover:bg-vjj-bronze"
          >
            <ShoppingBag size={18} />

            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-vjj-gold text-xs font-bold text-black"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-full border border-black/10 p-2.5 lg:hidden"
          >
            <motion.div
              animate={{ rotate: mobileOpen ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden border-t border-black/10 bg-[#fbf7ef] shadow-xl lg:hidden"
          >
            <div className="px-5 py-5">
              <motion.div variants={itemVariants} className="grid gap-3">
                <MobileLink to="/" onClick={closeMobile}>
                  Home
                </MobileLink>

                <MobileLink to="/products" onClick={closeMobile}>
                  All Jewellery
                </MobileLink>

                <MobileLink to="/products?featured=true" onClick={closeMobile}>
                  Signature
                </MobileLink>

                <MobileLink
                  to="/products?readyToShip=true"
                  onClick={closeMobile}
                >
                  Ready To Ship
                </MobileLink>

                <MobileLink to="/cart" onClick={closeMobile}>
                  Cart
                </MobileLink>

                <MobileLink to="/dashboard" onClick={closeMobile}>
                  My Account
                </MobileLink>

                <motion.a
                  variants={itemVariants}
                  href="https://maps.app.goo.gl/qPDMbrZeXN9yqtd28?g_st=iw"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMobile}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-vjj-black shadow-sm"
                >
                  Visit Store
                </motion.a>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-5 border-t border-black/10 pt-5"
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-vjj-bronze">
                  Categories
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category, index) => (
                    <motion.div
                      key={category}
                      variants={itemVariants}
                      custom={index}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link
                        to={`/products?category=${encodeURIComponent(
                          category,
                        )}`}
                        onClick={closeMobile}
                        className="block rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-vjj-black shadow-sm transition hover:bg-vjj-black hover:text-white"
                      >
                        {category}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <motion.div variants={itemVariants} whileTap={{ scale: 0.97 }}>
      <Link
        to={to}
        onClick={onClick}
        className="block rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-vjj-black shadow-sm transition hover:bg-vjj-black hover:text-white"
      >
        {children}
      </Link>
    </motion.div>
  );
}
