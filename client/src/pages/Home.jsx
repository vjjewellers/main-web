import HeroSection from "../components/home/HeroSection";
import { CATEGORIES } from "../utils/constants";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
              Shop by category
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-vjj-black">
              Discover your perfect piece
            </h2>
          </div>

          <Link
            to="/products"
            className="rounded-full bg-vjj-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
          >
            View All Jewellery
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.slice(0, 8).map((category) => (
            <Link
              key={category}
              to={`/products?category=${encodeURIComponent(category)}`}
              className="group rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-luxury"
            >
              <div className="mb-8 h-32 rounded-[1.5rem] bg-gradient-to-br from-vjj-ivory via-white to-amber-100" />
              <p className="font-serif text-2xl font-bold text-vjj-black group-hover:text-vjj-bronze">
                {category}
              </p>
              <p className="mt-2 text-sm text-stone-600">
                Explore premium {category.toLowerCase()} from VJJ Shop.
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
