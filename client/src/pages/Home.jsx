import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MetalRateTicker from "../components/home/MetalRateTicker";
import {
  ArrowRight,
  Camera,
  Crown,
  Gem,
  Heart,
  PlayCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

import { getProductsFromSupabase } from "../services/supabaseProducts";
import ProductCard from "../components/product/ProductCard";
import { BRAND, CATEGORIES } from "../utils/constants";

const heroImages = [
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=90",
  "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1200&q=90",
  "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=90",
];

const mobileBrandingImage =
  "https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=900&q=90";

const collectionCards = [
  {
    title: "Gold Essentials",
    text: "Timeless gold-inspired jewellery for everyday elegance.",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=90",
    link: "/products?material=Gold",
  },
  {
    title: "Wedding Collection",
    text: "Graceful jewellery designs for wedding and festive moments.",
    image:
      "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1000&q=90",
    link: "/products",
  },
  {
    title: "Daily Wear",
    text: "Lightweight jewellery pieces made for regular use.",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=90",
    link: "/products",
  },
];

const occasionCards = [
  {
    title: "For Her",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=90",
  },
  {
    title: "Bridal Picks",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=90",
  },
  {
    title: "Gift Jewellery",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=90",
  },
  {
    title: "Festive Looks",
    image:
      "https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=900&q=90",
  },
];

const reelCards = [
  {
    title: "New Gold Ring Designs",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=700&q=90",
  },
  {
    title: "Bridal Jewellery Look",
    image:
      "https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=700&q=90",
  },
  {
    title: "Daily Wear Collection",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&q=90",
  },
  {
    title: "Store Favourites",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=700&q=90",
  },
];

const trustItems = [
  {
    icon: <ShieldCheck />,
    title: "Trusted Store",
    text: "Authentic jewellery with customer-first support.",
  },
  {
    icon: <Truck />,
    title: "Delivery Support",
    text: "Store team coordinates enquiry and delivery details.",
  },
  {
    icon: <Gem />,
    title: "Premium Designs",
    text: "Curated gold, silver and jewellery collections.",
  },
];

const categoryImages = {
  Rings:
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=90",
  Earrings:
    "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=90",
  Pendants:
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=90",
  Bangles:
    "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=600&q=90",
  Bracelets:
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=90",
  Mangalsutra:
    "https://images.unsplash.com/photo-1620656798579-1984d9e87df2?auto=format&fit=crop&w=600&q=90",
  Necklace:
    "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=600&q=90",
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const data = await getProductsFromSupabase({
        limit: 8,
      });

      setProducts(data.products || []);

      setProducts(data.products || data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch products");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const featuredProducts = useMemo(() => {
    const featured = products.filter((product) => product.isFeatured);
    return featured.length ? featured.slice(0, 4) : products.slice(0, 4);
  }, [products]);

  const newProducts = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  const visibleCategories = CATEGORIES.slice(0, 8);

  return (
    <main className="overflow-hidden bg-transparent">
      <MetalRateTicker />
      <section className="relative px-4 pt-5 sm:px-5 lg:px-8 lg:pt-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-12%] top-[-10%] h-96 w-96 rounded-full bg-blue-200/60 blur-3xl" />
          <div className="absolute right-[-8%] top-[8%] h-96 w-96 rounded-full bg-sky-100 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center xl:gap-10">
          {/* Mobile-only portrait branding image */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="overflow-hidden rounded-[2rem] border border-vjj-champagne bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:hidden"
          >
            <div className="relative overflow-hidden rounded-[1.5rem]">
              <img
                src={mobileBrandingImage}
                alt="Verma ji jewellers branding"
                className="h-[520px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-vjj-bronze">
                  <Sparkles size={14} />
                  Verma ji jewellers
                </p>

                <h2 className="mt-4 font-serif text-4xl font-bold leading-tight text-white">
                  Elegant jewellery for every moment
                </h2>

                <p className="mt-3 text-sm leading-6 text-blue-50">
                  Browse premium designs and enquire directly on WhatsApp.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="rounded-[2rem] border border-vjj-champagne bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-7 md:rounded-[2.5rem] md:p-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-vjj-champagne bg-vjj-soft px-4 py-2 text-sm font-bold text-vjj-bronze">
              <Sparkles size={16} />
              Verma ji jewellers
            </div>

            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-vjj-black sm:text-5xl md:text-6xl xl:text-7xl">
              Jewellery that feels{" "}
              <span className="text-vjj-gold">light, elegant</span> and
              timeless.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-vjj-coffee sm:text-lg sm:leading-8">
              Explore premium gold, silver and jewellery collections crafted for
              daily wear, wedding moments, festive looks and gifting.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-gold px-7 py-4 text-sm font-bold text-white shadow-lg shadow-vjj-gold/20 transition hover:-translate-y-0.5 hover:bg-vjj-bronze"
              >
                View Collection
                <ArrowRight size={18} />
              </Link>

              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-vjj-champagne bg-vjj-soft px-7 py-4 text-sm font-bold text-slate-900 transition hover:bg-white"
              >
                <Camera size={18} />
                Follow Instagram
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <HeroMiniStat label="Collections" value="100+" />
              <HeroMiniStat label="Support" value="Store" />
              <HeroMiniStat label="Style" value="Premium" />
            </div>
          </motion.div>

          {/* Desktop-only hero image grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="hidden gap-4 md:grid-cols-2 lg:grid"
          >
            <div className="overflow-hidden rounded-[2rem] border border-vjj-champagne bg-white p-3 shadow-[0_24px_80px_rgba(59,130,246,0.15)] md:col-span-2 md:rounded-[2.5rem]">
              <img
                src={heroImages[0]}
                alt="Jewellery collection"
                className="h-[300px] w-full rounded-[1.5rem] object-cover sm:h-[380px] md:h-[480px] xl:h-[560px]"
              />
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-vjj-champagne bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
              <img
                src={heroImages[1]}
                alt="Gold jewellery"
                className="h-44 w-full rounded-[1.5rem] object-cover sm:h-48"
              />
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-vjj-champagne bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
              <img
                src={heroImages[2]}
                alt="Jewellery design"
                className="h-44 w-full rounded-[1.5rem] object-cover sm:h-48"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-5 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-4 md:grid-cols-3">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-[2rem] border border-vjj-champagne bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(59,130,246,0.14)]"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-champagne text-vjj-bronze">
                {item.icon}
              </div>

              <h3 className="mt-5 font-serif text-2xl font-bold text-vjj-black">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-vjj-coffee">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionHeader
        eyebrow="Shop by Category"
        title="Find your perfect jewellery"
        text="Browse jewellery by popular categories."
        link="/products"
      />

      <section className="px-4 pb-12 sm:px-5 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCategories.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
            >
              <Link
                to={`/products?category=${encodeURIComponent(category)}`}
                className="group block overflow-hidden rounded-[2rem] border border-vjj-champagne bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(59,130,246,0.18)]"
              >
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img
                    src={
                      categoryImages[category] ||
                      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=90"
                    }
                    alt={category}
                    className="h-48 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-52"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif text-2xl font-bold text-white">
                      {category}
                    </h3>

                    <p className="mt-1 text-sm text-blue-50">
                      Explore collection
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionHeader
        eyebrow="Signature Cards"
        title="Collections made for every moment"
        text="Premium cards inspired by modern jewellery storefronts."
        link="/products"
      />

      <section className="px-4 pb-12 sm:px-5 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-3">
          {collectionCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.48, delay: index * 0.08 }}
            >
              <Link
                to={card.link}
                className="group block overflow-hidden rounded-[2rem] border border-vjj-champagne bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(59,130,246,0.18)]"
              >
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-[310px] w-full object-cover transition duration-500 group-hover:scale-105 sm:h-[360px]"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                      {card.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-blue-50">
                      {card.text}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-vjj-black transition group-hover:bg-vjj-gold group-hover:text-white">
                      Explore
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionHeader
        eyebrow="Featured Jewellery"
        title="Handpicked favourites"
        text="A curated selection of jewellery products."
        link="/products"
      />

      <section className="px-4 pb-12 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          {loadingProducts ? (
            <ProductSkeleton />
          ) : featuredProducts.length === 0 ? (
            <EmptyProducts />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-5 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {occasionCards.map((card, index) => (
            <motion.div
              key={`${card.title}-${index}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <Link
                to="/products"
                className="group block overflow-hidden rounded-[2rem] border border-vjj-champagne bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(59,130,246,0.14)]"
              >
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent" />

                  <div className="absolute bottom-4 left-4">
                    <p className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-vjj-black">
                      <Heart size={15} />
                      {card.title}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionHeader
        eyebrow="Instagram Reels"
        title="Watch latest jewellery reels"
        text="Connect your real Instagram videos later. This section is ready for showcase."
        link={BRAND.instagram}
        external
      />

      <section className="px-4 pb-12 sm:px-5 lg:px-8">
        <div className="mx-auto grid max-w-[1500px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reelCards.map((reel, index) => (
            <motion.div
              key={reel.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
            >
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-[2rem] border border-vjj-champagne bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(59,130,246,0.14)]"
              >
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img
                    src={reel.image}
                    alt={reel.title}
                    className="h-[360px] w-full object-cover transition duration-700 group-hover:scale-110 sm:h-[430px] lg:h-[500px]"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />

                  <div className="absolute inset-0 grid place-items-center">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-vjj-bronze shadow-xl">
                      <PlayCircle size={34} />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-serif text-2xl font-bold text-white">
                      {reel.title}
                    </p>

                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-blue-100">
                      <Camera size={15} />
                      View on Instagram
                    </p>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      <SectionHeader
        eyebrow="New Arrivals"
        title="Freshly added products"
        text="Recently added jewellery from the store."
        link="/products"
      />

      <section className="px-4 pb-16 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          {loadingProducts ? (
            <ProductSkeleton />
          ) : newProducts.length === 0 ? (
            <EmptyProducts />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {newProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="overflow-hidden rounded-[2rem] border border-vjj-champagne bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-6 md:rounded-[2.5rem] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <div className="grid h-16 w-16 place-items-center rounded-full bg-vjj-champagne text-vjj-bronze">
                  <Crown size={32} />
                </div>

                <h2 className="mt-6 font-serif text-4xl font-bold text-vjj-black sm:text-5xl">
                  Visit our store or enquire online
                </h2>

                <p className="mt-4 text-base leading-7 text-vjj-coffee sm:text-lg sm:leading-8">
                  Browse products online and contact the store directly for
                  jewellery enquiry, confirmation and delivery support.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-gold px-7 py-4 text-sm font-bold text-white transition hover:bg-vjj-bronze"
                  >
                    View Collection
                    <ArrowRight size={18} />
                  </Link>

                  <a
                    href={BRAND.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-vjj-champagne bg-vjj-soft px-7 py-4 text-sm font-bold text-vjj-black transition hover:bg-white"
                  >
                    Store Location
                  </a>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <img
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=90"
                  alt="Jewellery"
                  className="h-72 rounded-[2rem] object-cover md:h-96"
                  loading="lazy"
                />
                <img
                  src="https://images.unsplash.com/photo-1603974372039-adc49044b6bd?auto=format&fit=crop&w=900&q=90"
                  alt="Jewellery store"
                  className="h-72 rounded-[2rem] object-cover md:mt-12 md:h-96"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroMiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-vjj-champagne bg-vjj-soft p-4">
      <p className="font-serif text-3xl font-bold text-vjj-black">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text, link, external = false }) {
  const content = (
    <>
      View All
      <ArrowRight size={16} />
    </>
  );

  return (
    <section className="px-4 py-8 sm:px-5 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-gold">
            {eyebrow}
          </p>

          <h2 className="mt-2 font-serif text-4xl font-bold text-vjj-black md:text-5xl">
            {title}
          </h2>

          <p className="mt-3 max-w-2xl text-vjj-coffee">{text}</p>
        </div>

        {external ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-vjj-champagne bg-white px-5 py-2.5 text-sm font-bold text-vjj-black transition hover:bg-vjj-gold hover:text-white"
          >
            {content}
          </a>
        ) : (
          <Link
            to={link}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-vjj-champagne bg-white px-5 py-2.5 text-sm font-bold text-vjj-black transition hover:bg-vjj-gold hover:text-white"
          >
            {content}
          </Link>
        )}
      </div>
    </section>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-[430px] animate-pulse rounded-[2rem] bg-white"
        />
      ))}
    </div>
  );
}

function EmptyProducts() {
  return (
    <div className="rounded-[2rem] border border-vjj-champagne bg-white p-10 text-center shadow-[0_20px_70px_rgba(15,23,42,0.05)]">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-vjj-champagne text-vjj-bronze">
        <ShoppingBag />
      </div>

      <h3 className="mt-5 font-serif text-3xl font-bold text-vjj-black">
        No products added yet
      </h3>

      <p className="mt-2 text-vjj-coffee">
        Products added from admin panel will appear here.
      </p>
    </div>
  );
}
