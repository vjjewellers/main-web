import { BRAND, CATEGORIES } from "../../utils/constants";

export default function Footer() {
  return (
    <footer className="bg-vjj-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-[0.35em] text-vjj-champagne">
            {BRAND.companyName}
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold">
            Jewellery made for timeless moments.
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-stone-300">
            Premium gold, diamond and bridal jewellery from Kaptanganj,
            Kushinagar. Designed for elegance, trust and celebration.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-vjj-champagne">Categories</h3>
          <div className="grid gap-2 text-sm text-stone-300">
            {CATEGORIES.slice(0, 7).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-vjj-champagne">Contact</h3>
          <div className="grid gap-3 text-sm leading-6 text-stone-300">
            <p>{BRAND.phone}</p>
            <p>{BRAND.customerEmail}</p>
            <p>{BRAND.businessEmail}</p>
            <p>{BRAND.address}</p>
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-vjj-champagne hover:underline"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-center text-sm text-stone-400">
        © {new Date().getFullYear()} VJJ Shop. All rights reserved.
      </div>
    </footer>
  );
}
