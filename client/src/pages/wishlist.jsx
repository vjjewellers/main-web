import { useEffect } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import ProductCard from "../components/product/ProductCard";
import {
  fetchWishlist,
  removeGuestWishlistItem,
  removeWishlistItem,
} from "../features/wishlist/wishlistSlice";

export default function Wishlist() {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { items, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  const handleClearWishlist = async () => {
    if (items.length === 0) return;

    const confirmClear = window.confirm("Remove all products from wishlist?");
    if (!confirmClear) return;

    if (user) {
      for (const item of items) {
        await dispatch(removeWishlistItem(item._id));
      }
    } else {
      for (const item of items) {
        dispatch(removeGuestWishlistItem(item._id));
      }
    }

    toast.success("Wishlist cleared");
  };

  return (
    <section className="min-h-screen bg-vjj-ivory">
      <div className="relative overflow-hidden bg-vjj-black px-5 py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,197,107,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-vjj-champagne">
            My Wishlist
          </p>

          <h1 className="mt-4 font-serif text-5xl font-bold md:text-7xl">
            Saved Jewellery
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            Keep your favourite jewellery pieces saved for later.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-stone-500">Total Saved</p>
            <h2 className="font-serif text-3xl font-bold text-vjj-black">
              {loading ? "Loading..." : `${items.length} Products`}
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
            >
              <ShoppingBag size={17} />
              Continue Shopping
            </Link>

            {items.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <Trash2 size={17} />
                Clear Wishlist
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[560px] animate-pulse rounded-[2rem] bg-white"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[2.5rem] border border-black/10 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
              <Heart size={38} />
            </div>

            <h2 className="mt-6 font-serif text-5xl font-bold text-vjj-black">
              No saved products
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-stone-600">
              Tap the heart icon on any product to save it here.
            </p>

            <Link
              to="/products"
              className="mt-8 inline-flex rounded-full bg-vjj-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
            >
              Explore Jewellery
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
