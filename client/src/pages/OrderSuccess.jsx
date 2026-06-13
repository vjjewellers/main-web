import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <section className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-5 py-20">
      <div className="w-full rounded-[2.5rem] border border-black/10 bg-white p-10 text-center shadow-luxury">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={42} />
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
          Order Confirmed
        </p>

        <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
          Thank you for your order
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-600">
          Your order has been placed successfully. Our team will verify the
          details and start processing your jewellery order shortly.
        </p>

        {id && (
          <div className="mx-auto mt-8 max-w-xl rounded-3xl bg-vjj-ivory p-5">
            <p className="text-sm text-stone-600">Order ID</p>
            <p className="mt-1 break-all font-mono text-sm font-bold text-vjj-black">
              {id}
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/dashboard"
            className="rounded-full bg-vjj-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
          >
            View My Orders
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-8 py-3 text-sm font-semibold text-vjj-black transition hover:bg-vjj-ivory"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
