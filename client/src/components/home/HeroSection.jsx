import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative min-h-[86vh] overflow-hidden bg-vjj-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(245,197,107,0.18),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.09),transparent_26%),linear-gradient(120deg,#080504,#130d0a_48%,#050505)]" />

      <div className="absolute left-[10%] top-[18%] h-32 w-32 rounded-full bg-vjj-champagne/10 blur-3xl" />
      <div className="absolute bottom-[12%] right-[20%] h-48 w-48 rounded-full bg-vjj-gold/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-[86vh] max-w-7xl grid-cols-1 items-center gap-12 px-5 py-20 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-4 inline-flex rounded-full border border-vjj-champagne/25 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-vjj-champagne backdrop-blur">
            Verma ji jewellers
          </p>

          <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Jewellery Crafted for Your Finest Moments
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-300">
            Explore premium gold, diamond and bridal jewellery with a cinematic
            shopping experience made for trust, beauty and celebration.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/products"
              className="rounded-full bg-gradient-to-r from-vjj-champagne via-vjj-gold to-vjj-bronze px-8 py-3 text-center text-sm font-bold text-black shadow-glow transition hover:scale-105"
            >
              Explore Collection
            </Link>

            <a
              href="https://maps.app.goo.gl/qPDMbrZeXN9yqtd28?g_st=iw"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 bg-white/5 px-8 py-3 text-center text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              Visit Store
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-8 rounded-[3rem] bg-vjj-champagne/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-xl">
            <img
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1100&q=90"
              alt="Premium gold jewellery"
              className="h-[520px] w-full rounded-[2rem] object-cover"
            />

            <div className="absolute inset-3 rounded-[2rem] bg-gradient-to-t from-black/65 via-transparent to-white/5" />

            <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-vjj-champagne">
                Premium Studio Finish
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-200">
                High-contrast jewellery displays with soft cinematic glow and
                luxury-first presentation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
