import { useEffect, useState } from "react";
import { ShoppingBag, Heart, ShieldCheck, Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  fetchProductBySlug,
  clearSelectedProduct,
} from "../features/products/productSlice";

import {
  addCartItem,
  addGuestCartItem,
  openCart,
} from "../features/cart/cartSlice";

import { formatCurrency } from "../utils/formatCurrency";

export default function ProductDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const {
    selectedProduct: product,
    loading,
    error,
  } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [slug, dispatch]);

  useEffect(() => {
    if (product) {
      const primaryImage =
        product.images?.find((image) => image.isPrimary)?.url ||
        product.images?.[0]?.url ||
        "";

      setActiveImage(primaryImage);
      setSelectedSize(product.sizes?.[0] || "");
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;

    const payload = {
      productId: product._id,
      quantity: 1,
      selectedSize,
      selectedMaterial: product.material,
    };

    if (user) {
      const result = await dispatch(addCartItem(payload));

      if (addCartItem.fulfilled.match(result)) {
        toast.success("Added to cart");
        dispatch(openCart());
      } else {
        toast.error(result.payload || "Unable to add item");
      }
    } else {
      dispatch(
        addGuestCartItem({
          productId: product._id,
          name: product.name,
          slug: product.slug,
          image: activeImage,
          price: product.price,
          quantity: 1,
          selectedSize,
          selectedMaterial: product.material,
          stock: product.stock,
        }),
      );

      dispatch(openCart());
      toast.success("Added to cart");
    }
  };

  if (loading) {
    return (
      <section className="mx-auto min-h-screen max-w-7xl px-5 py-14">
        <div className="h-[650px] animate-pulse rounded-[2.5rem] bg-white" />
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="mx-auto min-h-screen max-w-4xl px-5 py-20 text-center">
        <h1 className="font-serif text-5xl font-bold">Product not found</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-screen max-w-7xl px-5 py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-[2.5rem] border border-black/10 bg-white p-4 shadow-luxury">
            <img
              src={`${activeImage}?auto=format&fit=crop&w=1200&q=90`}
              alt={product.name}
              className="h-[620px] w-full rounded-[2rem] object-cover"
            />
          </div>

          <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
            {product.images?.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(image.url)}
                className={`h-24 w-24 shrink-0 overflow-hidden rounded-2xl border p-1 ${
                  activeImage === image.url
                    ? "border-vjj-gold"
                    : "border-black/10"
                }`}
              >
                <img
                  src={`${image.url}?auto=format&fit=crop&w=250&q=90`}
                  alt={image.alt || product.name}
                  className="h-full w-full rounded-xl object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:pt-8">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            {product.category}
          </p>

          <h1 className="mt-3 font-serif text-5xl font-bold leading-tight text-vjj-black">
            {product.name}
          </h1>

          <p className="mt-5 text-lg leading-8 text-stone-600">
            {product.description}
          </p>

          <div className="mt-7 flex items-end gap-4">
            <p className="text-4xl font-bold text-vjj-black">
              {formatCurrency(product.price)}
            </p>

            {product.compareAtPrice > product.price && (
              <p className="pb-1 text-lg text-stone-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            )}
          </div>

          <div className="mt-8 grid gap-4 rounded-[2rem] border border-black/10 bg-white p-6">
            <div className="flex justify-between border-b border-black/10 pb-3 text-sm">
              <span className="text-stone-500">Material</span>
              <strong>{product.material}</strong>
            </div>

            <div className="flex justify-between border-b border-black/10 pb-3 text-sm">
              <span className="text-stone-500">Purity</span>
              <strong>{product.purity}</strong>
            </div>

            <div className="flex justify-between border-b border-black/10 pb-3 text-sm">
              <span className="text-stone-500">SKU</span>
              <strong>{product.sku}</strong>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Availability</span>
              <strong>{product.stock > 0 ? "In Stock" : "Out of Stock"}</strong>
            </div>
          </div>

          {product.sizes?.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-vjj-bronze">
                Select Size
              </p>

              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                      selectedSize === size
                        ? "border-vjj-black bg-vjj-black text-white"
                        : "border-black/10 bg-white hover:border-vjj-gold"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-vjj-black px-8 py-4 text-sm font-bold text-white transition hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingBag size={18} />
              Add to Cart
            </button>

            <button className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-8 py-4 text-sm font-bold text-vjj-black transition hover:bg-vjj-ivory">
              <Heart size={18} />
              Wishlist
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-black/10 bg-white p-5">
              <ShieldCheck className="text-vjj-bronze" />
              <h3 className="mt-3 font-serif text-xl font-bold">
                Trusted Quality
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Premium jewellery from Verma ji jewellers with verified product
                details.
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-5">
              <Truck className="text-vjj-bronze" />
              <h3 className="mt-3 font-serif text-xl font-bold">
                Secure Delivery
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Safe packaging and order tracking support after confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
