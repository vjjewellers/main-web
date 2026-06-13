import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  loginUser,
  registerUser,
  clearAuthError,
} from "../features/auth/authSlice";

import { mergeGuestCart } from "../features/cart/cartSlice";
import { mergeGuestWishlist } from "../features/wishlist/wishlistSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading, error } = useSelector((state) => state.auth);

  const redirectTo = location.state?.redirectTo || "/";

  const [isRegister, setIsRegister] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const afterLoginWork = async () => {
    setIsMerging(true);

    try {
      await dispatch(mergeGuestCart()).unwrap();
      await dispatch(mergeGuestWishlist()).unwrap();

      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error || "Login successful, but cart merge failed.");
      navigate(redirectTo, { replace: true });
    } finally {
      setIsMerging(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isRegister) {
      const result = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(result)) {
        toast.success("Registration successful");

        await dispatch(mergeGuestCart()).unwrap();
        await dispatch(mergeGuestWishlist()).unwrap();

        navigate(redirectTo, { replace: true });
      }

      return;
    }

    const result = await dispatch(
      loginUser({
        email: formData.email,
        password: formData.password,
      }),
    );

    if (loginUser.fulfilled.match(result)) {
      toast.success("Login successful");
      await afterLoginWork();
    }
  };

  return (
    <section className="min-h-screen bg-vjj-black px-5 py-16 text-white">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl md:grid-cols-2">
        <div className="relative hidden min-h-[650px] overflow-hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1100&q=90"
            alt="VJJ jewellery login"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-10 left-10 right-10">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-vjj-champagne">
              Verma ji jewellers
            </p>

            <h1 className="mt-4 font-serif text-5xl font-bold">
              Welcome to VJJ Shop
            </h1>

            <p className="mt-4 max-w-md leading-7 text-stone-200">
              Login to track your orders, save addresses, manage wishlist and
              continue your premium jewellery shopping experience.
            </p>
          </div>
        </div>

        <div className="flex items-center px-6 py-12 md:px-12">
          <div className="w-full">
            <Link
              to="/"
              className="mb-8 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-stone-300 hover:bg-white/10"
            >
              ← Back to home
            </Link>

            <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-champagne">
              {isRegister ? "Create Account" : "Member Login"}
            </p>

            <h2 className="mt-3 font-serif text-4xl font-bold">
              {isRegister ? "Register" : "Login"}
            </h2>

            {redirectTo === "/checkout" && (
              <p className="mt-4 rounded-2xl border border-vjj-champagne/20 bg-vjj-champagne/10 p-4 text-sm leading-6 text-vjj-champagne">
                Please login to continue your checkout. Your guest cart will be
                saved to your account.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
              {isRegister && (
                <>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-stone-400 focus:border-vjj-champagne"
                    required
                  />

                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-stone-400 focus:border-vjj-champagne"
                  />
                </>
              )}

              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                type="email"
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-stone-400 focus:border-vjj-champagne"
                required
              />

              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                type="password"
                className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-white outline-none placeholder:text-stone-400 focus:border-vjj-champagne"
                required
              />

              <button
                disabled={loading || isMerging}
                className="mt-3 rounded-full bg-gradient-to-r from-vjj-champagne via-vjj-gold to-vjj-bronze px-6 py-4 font-bold text-black shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading || isMerging
                  ? "Please wait..."
                  : isRegister
                    ? "Create Account"
                    : "Login"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setIsRegister((prev) => !prev)}
              className="mt-6 text-sm text-stone-300 hover:text-vjj-champagne"
            >
              {isRegister
                ? "Already have an account? Login"
                : "New customer? Create an account"}
            </button>

            <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-300">
              Guest cart and guest wishlist will automatically merge into your
              account after login.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
