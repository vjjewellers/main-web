import { X, ShoppingBag, Trash2, Minus, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  closeCart,
  removeCartItem,
  removeGuestCartItem,
  updateCartItem,
  updateGuestCartQuantity,
  selectCartSubtotal,
} from "../../features/cart/cartSlice";
import { formatCurrency } from "../../utils/formatCurrency";

export default function CartDrawer() {
  const dispatch = useDispatch();

  const { items, isCartOpen } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const subtotal = useSelector(selectCartSubtotal);

  const handleRemove = async (item) => {
    const productId = item.product?._id || item.productId;

    if (user && item.product?._id) {
      const result = await dispatch(removeCartItem(productId));

      if (removeCartItem.fulfilled?.match?.(result)) {
        toast.success("Item removed");
      }
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

  return (
    <>
      {isCartOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
          onClick={() => dispatch(closeCart())}
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-[90] h-full w-full max-w-md transform bg-[#fbf7ef] shadow-2xl transition duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-vjj-bronze">
              VJJ Shop
            </p>
            <h2 className="font-serif text-2xl font-bold">Your Cart</h2>
          </div>

          <button
            onClick={() => dispatch(closeCart())}
            className="rounded-full border border-black/10 p-2 transition hover:bg-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-[calc(100%-205px)] overflow-y-auto px-5 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow">
                <ShoppingBag />
              </div>

              <h3 className="mt-5 font-serif text-2xl font-bold">
                Your cart is empty
              </h3>

              <p className="mt-2 text-sm text-stone-600">
                Add beautiful jewellery pieces to continue.
              </p>

              <Link
                to="/products"
                onClick={() => dispatch(closeCart())}
                className="mt-6 rounded-full bg-vjj-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
              >
                Shop Jewellery
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item, index) => {
                const product = item.product || item;
                const productId = product._id || item.productId;

                const image =
                  product.images?.[0]?.url ||
                  item.image ||
                  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=90";

                const quantity = Number(item.quantity || 1);
                const lineTotal = Number(product.price || 0) * quantity;

                return (
                  <div
                    key={`${productId}-${item.selectedSize || "default"}-${index}`}
                    className="rounded-3xl border border-black/10 bg-white p-3 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <img
                        src={`${image}?auto=format&fit=crop&w=300&q=90`}
                        alt={product.name}
                        className="h-24 w-24 rounded-2xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 font-serif text-lg font-bold">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-vjj-bronze">
                          {item.selectedMaterial || product.material}
                          {item.selectedSize
                            ? ` · Size ${item.selectedSize}`
                            : ""}
                        </p>

                        <p className="mt-2 text-sm font-bold">
                          {formatCurrency(product.price)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(item)}
                        className="h-9 w-9 rounded-full border border-black/10 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mx-auto" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3">
                      <div className="inline-flex items-center rounded-full border border-black/10 bg-vjj-ivory p-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item, quantity - 1)
                          }
                          disabled={quantity <= 1}
                          className="grid h-8 w-8 place-items-center rounded-full bg-white text-vjj-black transition hover:bg-vjj-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="min-w-10 text-center text-sm font-bold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(item, quantity + 1)
                          }
                          className="grid h-8 w-8 place-items-center rounded-full bg-white text-vjj-black transition hover:bg-vjj-black hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-stone-500">Total</p>
                        <p className="font-bold text-vjj-black">
                          {formatCurrency(lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-black/10 bg-white px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-stone-600">Subtotal</span>
            <span className="text-xl font-bold">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="grid gap-3">
            <Link
              to="/cart"
              onClick={() => dispatch(closeCart())}
              className="block rounded-full border border-black/10 bg-white px-6 py-3 text-center text-sm font-semibold text-vjj-black transition hover:bg-vjj-ivory"
            >
              View Cart
            </Link>

            <Link
              to="/checkout"
              onClick={() => dispatch(closeCart())}
              className={`block rounded-full px-6 py-3 text-center text-sm font-semibold transition ${
                items.length === 0
                  ? "pointer-events-none bg-stone-300 text-stone-500"
                  : "bg-vjj-black text-white hover:bg-vjj-bronze"
              }`}
            >
              Proceed to Checkout
            </Link>
          </div>

          <p className="mt-3 text-center text-xs text-stone-500">
            Shipping and GST will be calculated at checkout.
          </p>
        </div>
      </aside>
    </>
  );
}
