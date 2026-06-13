import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import api from "../services/api";
import {
  clearGuestCart,
  clearServerCart,
  fetchCart,
  selectCartSubtotal,
} from "../features/cart/cartSlice";
import { formatCurrency } from "../utils/formatCurrency";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const subtotal = useSelector(selectCartSubtotal);

  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  const taxAmount = Math.round(subtotal * 0.03);
  const shippingCost = subtotal >= 50000 ? 0 : subtotal > 0 ? 180 : 0;
  const totalAmount = subtotal + taxAmount + shippingCost;

  const handleChange = (event) => {
    setShippingAddress((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error("Please login to place your order");
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/products");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/orders/checkout", {
        shippingAddress,
        paymentProvider: "mock",
        notes: "Frontend mock checkout order.",
        saveAddress: true,
      });

      toast.success("Order placed successfully");

      dispatch(clearServerCart());
      dispatch(clearGuestCart());

      navigate(`/order-success/${data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <section className="mx-auto min-h-screen max-w-4xl px-5 py-20 text-center">
        <h1 className="font-serif text-5xl font-bold">Login Required</h1>
        <p className="mt-4 text-stone-600">
          Please login before proceeding to checkout.
        </p>

        <Link
          to="/login"
          className="mt-8 inline-flex rounded-full bg-vjj-black px-8 py-3 text-sm font-semibold text-white hover:bg-vjj-bronze"
        >
          Login to Continue
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-screen max-w-7xl px-5 py-14">
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
          Secure Checkout
        </p>
        <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
          Complete Your Order
        </h1>
      </div>

      <form
        onSubmit={handleCheckout}
        className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]"
      >
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-3xl font-bold">Shipping Details</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              name="fullName"
              value={shippingAddress.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-vjj-gold"
              required
            />

            <input
              name="phone"
              value={shippingAddress.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-vjj-gold"
              required
            />

            <input
              name="line1"
              value={shippingAddress.line1}
              onChange={handleChange}
              placeholder="Address Line 1"
              className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-vjj-gold md:col-span-2"
              required
            />

            <input
              name="line2"
              value={shippingAddress.line2}
              onChange={handleChange}
              placeholder="Address Line 2"
              className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-vjj-gold md:col-span-2"
            />

            <input
              name="city"
              value={shippingAddress.city}
              onChange={handleChange}
              placeholder="City"
              className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-vjj-gold"
              required
            />

            <input
              name="state"
              value={shippingAddress.state}
              onChange={handleChange}
              placeholder="State"
              className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-vjj-gold"
              required
            />

            <input
              name="pincode"
              value={shippingAddress.pincode}
              onChange={handleChange}
              placeholder="Pincode"
              className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-vjj-gold"
              required
            />

            <input
              name="country"
              value={shippingAddress.country}
              onChange={handleChange}
              placeholder="Country"
              className="rounded-2xl border border-black/10 px-5 py-4 outline-none focus:border-vjj-gold"
              required
            />
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-3xl font-bold">Order Summary</h2>

          <div className="mt-6 grid gap-4">
            {items.map((item, index) => {
              const product = item.product || item;
              const image =
                product.images?.[0]?.url ||
                item.image ||
                "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=90";

              return (
                <div
                  key={`${product._id || product.productId}-${index}`}
                  className="flex gap-3 rounded-2xl bg-vjj-ivory p-3"
                >
                  <img
                    src={`${image}?auto=format&fit=crop&w=220&q=90`}
                    alt={product.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="line-clamp-2 font-serif font-bold">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-stone-600">
                      Qty: {item.quantity}
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 border-t border-black/10 pt-5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>

            <div className="flex justify-between">
              <span>GST 3%</span>
              <strong>{formatCurrency(taxAmount)}</strong>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <strong>{formatCurrency(shippingCost)}</strong>
            </div>

            <div className="flex justify-between border-t border-black/10 pt-4 text-xl">
              <span className="font-bold">Total</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
          </div>

          <button
            disabled={loading || items.length === 0}
            className="mt-6 w-full rounded-full bg-vjj-black px-6 py-4 text-sm font-bold text-white transition hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-stone-500">
            This is currently mock payment. Razorpay will be connected later for
            real online payments.
          </p>
        </aside>
      </form>
    </section>
  );
}
