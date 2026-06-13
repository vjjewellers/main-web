import { Heart, ShoppingBag, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  addCartItem,
  addGuestCartItem,
  openCart,
} from "../../features/cart/cartSlice";

import {
  addGuestWishlistItem,
  addWishlistItem,
  removeGuestWishlistItem,
  removeWishlistItem,
  selectIsWishlisted,
} from "../../features/wishlist/wishlistSlice";

import { formatCurrency } from "../../utils/formatCurrency";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const isWishlisted = useSelector(selectIsWishlisted(product._id));

  const primaryImage =
    product?.images?.find((image) => image.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=90";

  const productUrl = `/products/${product.slug}`;

  const handleAddToCart = async () => {
    const cartPayload = {
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: primaryImage,
      price: product.price,
      quantity: 1,
      selectedSize: product.sizes?.[0] || "",
      selectedMaterial: product.material,
      stock: product.stock,
    };

    if (user) {
      const result = await dispatch(
        addCartItem({
          productId: product._id,
          quantity: 1,
          selectedSize: product.sizes?.[0] || "",
          selectedMaterial: product.material,
        }),
      );

      if (addCartItem.fulfilled.match(result)) {
        toast.success("Added to cart");
        dispatch(openCart());
      } else {
        toast.error(result.payload || "Unable to add item");
      }
    } else {
      dispatch(addGuestCartItem(cartPayload));
      dispatch(openCart());
      toast.success("Added to cart");
    }
  };

  const handleWishlistToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (user) {
      if (isWishlisted) {
        const result = await dispatch(removeWishlistItem(product._id));

        if (removeWishlistItem.fulfilled.match(result)) {
          toast.success("Removed from wishlist");
        } else {
          toast.error(result.payload || "Unable to remove from wishlist");
        }
      } else {
        const result = await dispatch(addWishlistItem(product._id));

        if (addWishlistItem.fulfilled.match(result)) {
          toast.success("Added to wishlist");
        } else {
          toast.error(result.payload || "Unable to add to wishlist");
        }
      }
    } else {
      if (isWishlisted) {
        dispatch(removeGuestWishlistItem(product._id));
        toast.success("Removed from wishlist");
      } else {
        dispatch(addGuestWishlistItem(product));
        toast.success("Added to wishlist");
      }
    }
  };

  const handleQuickView = (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigate(productUrl);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[2rem] border border-stone-200/70 bg-[#fbf7ef] shadow-[0_18px_60px_rgba(30,20,10,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(30,20,10,0.16)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.95),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(245,232,210,0.45))]" />

      <div className="relative overflow-hidden p-4">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.55rem] bg-gradient-to-br from-stone-100 via-white to-amber-50">
          <Link to={productUrl} className="absolute inset-0 z-10">
            <span className="sr-only">View {product.name}</span>
          </Link>

          <img
            src={`${primaryImage}?auto=format&fit=crop&w=900&q=90`}
            alt={product.name}
            className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-110"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10 opacity-70 transition group-hover:opacity-50" />

          <div className="absolute left-4 top-4 z-20 flex gap-2">
            {product.isReadyToShip && (
              <span className="rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-100 backdrop-blur-md">
                Ready
              </span>
            )}

            {product.isFeatured && (
              <span className="rounded-full bg-amber-300/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-black">
                Signature
              </span>
            )}
          </div>

          <div className="absolute right-4 top-4 z-30 flex flex-col gap-2 opacity-100 transition duration-300 md:opacity-0 md:group-hover:opacity-100">
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`grid h-10 w-10 place-items-center rounded-full border border-white/25 backdrop-blur-xl transition ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-black/35 text-white hover:bg-red-500"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart size={17} fill={isWishlisted ? "currentColor" : "none"} />
            </button>

            <button
              type="button"
              onClick={handleQuickView}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-xl transition hover:bg-black/55"
              aria-label="View product"
            >
              <Eye size={17} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative px-5 pb-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-vjj-bronze">
            {product.material} · {product.purity}
          </p>

          <p className="text-xs text-stone-500">
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>
        </div>

        <Link to={productUrl}>
          <h3 className="line-clamp-2 min-h-[3rem] font-serif text-2xl font-bold leading-snug text-stone-950 transition hover:text-vjj-bronze">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
          {product.description}
        </p>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-stone-950">
              {formatCurrency(product.price)}
            </p>

            {product.compareAtPrice > product.price && (
              <p className="text-sm text-stone-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-950 text-amber-100 shadow-[0_14px_34px_rgba(0,0,0,0.25)] transition hover:scale-105 hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
            aria-label="Add to cart"
          >
            <ShoppingBag size={19} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
