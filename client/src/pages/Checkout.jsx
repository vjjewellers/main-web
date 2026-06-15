import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import api from "../services/api";

import {
  clearGuestCart,
  clearServerCart,
  selectCartItems,
  selectCartSubtotal,
} from "../features/cart/cartSlice";

import { formatCurrency } from "../utils/formatCurrency";
import { BRAND } from "../utils/constants";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  const [placingOrder, setPlacingOrder] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    paymentMethod: "cod",
    notes: "",
  });

  const gst = Math.round(subtotal * 0.03);
  const shipping = subtotal >= 50000 ? 0 : 180;
  const total = subtotal + gst + shipping;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/products");
      return false;
    }

    if (!user) {
      toast.error("Please login to place your order");

      sessionStorage.setItem("vjj_redirect_after_login", "/checkout");

      navigate("/login", {
        state: {
          redirectTo: "/checkout",
        },
      });

      return false;
    }

    if (!formData.fullName.trim()) {
      toast.error("Please enter full name");
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error("Please enter phone number");
      return false;
    }

    if (!formData.addressLine1.trim()) {
      toast.error("Please enter address");
      return false;
    }

    if (!formData.city.trim()) {
      toast.error("Please enter city");
      return false;
    }

    if (!formData.state.trim()) {
      toast.error("Please enter state");
      return false;
    }

    if (!formData.pincode.trim()) {
      toast.error("Please enter pincode");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setPlacingOrder(true);

      const payload = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,

          // Backend-required fields
          line1: formData.addressLine1,
          line2: formData.addressLine2,

          // Keeping these also for frontend display compatibility
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,

          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const { data } = await api.post("/orders/checkout", payload);

      if (!data.success) {
        toast.error(data.message || "Unable to place order");
        return;
      }

      toast.success("Order placed successfully");

      if (user) {
        dispatch(clearServerCart());
      } else {
        dispatch(clearGuestCart());
      }

      const orderId = data.order?._id || data.orderId || data._id;

      navigate(`/order-success/${orderId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <section className="min-h-screen bg-vjj-ivory">
      <div className="relative overflow-hidden bg-vjj-black px-5 py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,197,107,0.18),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-stone-300 transition hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Back to cart
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-[0.35em] text-vjj-champagne">
            Secure Checkout
          </p>

          <h1 className="mt-4 font-serif text-5xl font-bold md:text-7xl">
            Complete Your Order
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-300">
            Review your jewellery items, add shipping details and place your
            order securely.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1.35fr_0.65fr]">
        <form onSubmit={handlePlaceOrder} className="space-y-8">
          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
                <MapPin size={22} />
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold text-vjj-black">
                  Shipping Details
                </h2>
                <p className="text-sm text-stone-500">
                  Please provide accurate delivery information.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name"
                className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold"
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold"
              />

              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                type="email"
                className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold md:col-span-2"
              />

              <input
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Address line 1"
                className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold md:col-span-2"
              />

              <input
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Address line 2 / Landmark"
                className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold md:col-span-2"
              />

              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold"
              />

              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold"
              />

              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold"
              />

              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className="rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
                <CreditCard size={22} />
              </div>

              <div>
                <h2 className="font-serif text-3xl font-bold text-vjj-black">
                  Payment Method
                </h2>
                <p className="text-sm text-stone-500">
                  Online payment can be connected later with Razorpay.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label
                className={`cursor-pointer rounded-2xl border p-5 transition ${
                  formData.paymentMethod === "cod"
                    ? "border-vjj-gold bg-vjj-ivory"
                    : "border-black/10 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleChange}
                  className="hidden"
                />

                <p className="font-bold text-vjj-black">Cash on Delivery</p>
                <p className="mt-1 text-sm text-stone-500">
                  Pay after order confirmation.
                </p>
              </label>

              <label
                className={`cursor-pointer rounded-2xl border p-5 transition ${
                  formData.paymentMethod === "online"
                    ? "border-vjj-gold bg-vjj-ivory"
                    : "border-black/10 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={formData.paymentMethod === "online"}
                  onChange={handleChange}
                  className="hidden"
                />

                <p className="font-bold text-vjj-black">Online Payment</p>
                <p className="mt-1 text-sm text-stone-500">
                  Razorpay integration will be added later.
                </p>
              </label>
            </div>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Order notes, size instruction, preferred delivery time, etc."
              rows={4}
              className="mt-5 w-full resize-none rounded-2xl border border-black/10 bg-vjj-ivory px-5 py-4 outline-none focus:border-vjj-gold"
            />
          </div>

          <button
            type="submit"
            disabled={placingOrder || items.length === 0}
            className="w-full rounded-full bg-gradient-to-r from-vjj-black via-vjj-espresso to-vjj-bronze px-8 py-4 text-sm font-bold text-white shadow-luxury transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placingOrder
              ? "Placing Order..."
              : user
                ? `Place Order • ${formatCurrency(total)}`
                : "Login to Place Order"}
          </button>
        </form>

        <aside className="h-fit rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-serif text-3xl font-bold text-vjj-black">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-2xl bg-vjj-ivory p-5 text-center">
                <p className="font-semibold text-vjj-black">
                  Your cart is empty
                </p>

                <Link
                  to="/products"
                  className="mt-4 inline-flex rounded-full bg-vjj-black px-5 py-2 text-sm font-semibold text-white"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const product = item.product || item;
                const image = item.image || product.image;

                return (
                  <div
                    key={`${item.productId}-${item.selectedSize}-${item.selectedMaterial}`}
                    className="flex gap-4 rounded-2xl border border-black/10 p-3"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-semibold text-vjj-black">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Qty: {item.quantity}
                        {item.selectedSize
                          ? ` · Size: ${item.selectedSize}`
                          : ""}
                      </p>

                      <p className="mt-2 font-bold text-vjj-black">
                        {formatCurrency(product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 space-y-3 border-t border-black/10 pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-500">GST 3%</span>
              <strong>{formatCurrency(gst)}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-500">Shipping</span>
              <strong>
                {shipping === 0 ? "Free" : formatCurrency(shipping)}
              </strong>
            </div>

            <div className="flex justify-between border-t border-black/10 pt-4 text-lg">
              <span className="font-bold text-vjj-black">Total</span>
              <strong className="text-vjj-black">
                {formatCurrency(total)}
              </strong>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-vjj-ivory p-5">
            <div className="flex gap-3">
              <ShieldCheck className="shrink-0 text-vjj-bronze" size={22} />
              <div>
                <p className="font-bold text-vjj-black">Secure Order</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  For help, contact {BRAND.phone} or {BRAND.customerEmail}.
                </p>
              </div>
            </div>
          </div>

          {subtotal < 50000 && items.length > 0 && (
            <p className="mt-4 rounded-2xl border border-vjj-gold/20 bg-vjj-gold/10 p-4 text-sm leading-6 text-vjj-bronze">
              Add products worth {formatCurrency(50000 - subtotal)} more for
              free shipping.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
