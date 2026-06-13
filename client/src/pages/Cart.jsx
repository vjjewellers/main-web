import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  removeCartItem,
  removeGuestCartItem,
  updateCartItem,
  updateGuestCartQuantity,
  selectCartSubtotal,
} from "../features/cart/cartSlice";
import { formatCurrency } from "../utils/formatCurrency";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const subtotal = useSelector(selectCartSubtotal);

  const gst = Math.round(subtotal * 0.03);
  const shipping = subtotal >= 50000 ? 0 : subtotal > 0 ? 180 : 0;
  const total = subtotal + gst + shipping;

  const handleRemove = async (item) => {
    const product = item.product || item;
    const productId = product._id || item.productId;

    if (user && product._id) {
      await dispatch(removeCartItem(productId));
      toast.success("Item removed");
    } else {
      dispatch(removeGuestCartItem(productId));
      toast.success("Item removed");
    }
  };

  const handleQuantityChange = async (item, nextQuantity) => {
    const product = item.product || item;
    const productId = product._id || item.productId;
    const stock = product.stock || item.stock || 999;

    const safeQuantity = Math.max(1, Math.min(Number(nextQuantity), stock));

    if (safeQuantity !== Number(nextQuantity)) {
      toast.error(`Only ${stock} item(s) available in stock`);
      return;
    }

    if (user && product._id) {
      const result = await dispatch(
        updateCartItem({
          productId: product._id,
          quantity: safeQuantity,
          selectedSize: item.selectedSize || "",
          selectedMaterial: item.selectedMaterial || product.material || "",
        }),
      );

      if (updateCartItem.rejected.match(result)) {
        toast.error(result.payload || "Unable to update quantity");
      }
    } else {
      dispatch(
        updateGuestCartQuantity({
          productId,
          quantity: safeQuantity,
        }),
      );
    }
  };

  const goToCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-5 py-20 text-center">
        <div className="w-full rounded-[2.5rem] border border-black/10 bg-white p-10 shadow-luxury">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
            <ShoppingBag size={38} />
          </div>

          <h1 className="mt-6 font-serif text-5xl font-bold text-vjj-black">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-stone-600">
            Add beautiful jewellery pieces to your cart and continue shopping.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex rounded-full bg-vjj-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
          >
            Shop Jewellery
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-screen max-w-7xl px-5 py-14">
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
          Shopping Cart
        </p>
        <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
          Your Cart
        </h1>
        <p className="mt-3 text-stone-600">
          Review your jewellery items before checkout.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          {items.map((item, index) => {
            const product = item.product || item;
            const productId = product._id || item.productId;

            const image =
              product.images?.[0]?.url ||
              item.image ||
              "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=500&q=90";

            const quantity = Number(item.quantity || 1);
            const lineTotal = Number(product.price || 0) * quantity;

            return (
              <div
                key={`${productId}-${item.selectedSize || "default"}-${index}`}
                className="grid gap-5 rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm md:grid-cols-[140px_1fr_auto]"
              >
                <img
                  src={`${image}?auto=format&fit=crop&w=400&q=90`}
                  alt={product.name}
                  className="h-36 w-36 rounded-3xl object-cover"
                />

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-vjj-bronze">
                    {item.selectedMaterial || product.material}
                    {item.selectedSize ? ` · Size ${item.selectedSize}` : ""}
                  </p>

                  <h2 className="mt-2 font-serif text-3xl font-bold text-vjj-black">
                    {product.name}
                  </h2>

                  <p className="mt-2 text-sm text-stone-600">
                    {formatCurrency(product.price)} per item
                  </p>

                  <div className="mt-5 inline-flex items-center rounded-full border border-black/10 bg-vjj-ivory p-1">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item, quantity - 1)}
                      disabled={quantity <= 1}
                      className="grid h-9 w-9 place-items-center rounded-full bg-white transition hover:bg-vjj-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="min-w-12 text-center text-sm font-bold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item, quantity + 1)}
                      className="grid h-9 w-9 place-items-center rounded-full bg-white transition hover:bg-vjj-black hover:text-white"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between gap-5 md:flex-col md:items-end">
                  <div className="text-right">
                    <p className="text-sm text-stone-500">Total</p>
                    <p className="text-xl font-bold text-vjj-black">
                      {formatCurrency(lineTotal)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-3xl font-bold text-vjj-black">
            Order Summary
          </h2>

          <div className="mt-6 grid gap-4 border-b border-black/10 pb-5 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-600">GST 3%</span>
              <strong>{formatCurrency(gst)}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-600">Shipping</span>
              <strong>
                {shipping === 0 ? "Free" : formatCurrency(shipping)}
              </strong>
            </div>
          </div>

          <div className="mt-5 flex justify-between text-xl">
            <span className="font-bold">Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <button
            type="button"
            onClick={goToCheckout}
            className="mt-6 w-full rounded-full bg-vjj-black px-6 py-4 text-sm font-bold text-white transition hover:bg-vjj-bronze"
          >
            Proceed to Checkout
          </button>

          {!user && (
            <p className="mt-4 rounded-2xl bg-vjj-ivory p-4 text-center text-sm leading-6 text-stone-600">
              You can view cart as guest. Login is required only before placing
              the final order.
            </p>
          )}

          <Link
            to="/products"
            className="mt-4 block text-center text-sm font-semibold text-vjj-bronze hover:underline"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}
