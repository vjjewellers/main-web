import { Link } from "react-router-dom";
import {
  Camera,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { BRAND, CATEGORIES } from "../../utils/constants";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
  { label: "My Orders", href: "/dashboard" },
];

const customerLinks = [
  { label: "Rings", href: "/products?category=Rings" },
  { label: "Earrings", href: "/products?category=Earrings" },
  { label: "Necklace", href: "/products?category=Necklace" },
  { label: "Bangles", href: "/products?category=Bangles" },
  { label: "Bridal", href: "/products?category=Bridal" },
];

export default function Footer() {
  const phone = String(BRAND.phone || "").replace(/\D/g, "");
  const whatsappPhone = phone.startsWith("91") ? phone : `91${phone}`;

  const message = `Hello ${BRAND.displayName}, I want to know more about your jewellery collection.`;

  return (
    <footer className="relative overflow-hidden px-4 pb-6 pt-10 sm:px-5 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-[-10%] h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-8%] h-96 w-96 rounded-full bg-sky-100 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1500px]">
        <div className="glass-card overflow-hidden rounded-[2.5rem]">
          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
            <div>
              <Link to="/" className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-lg shadow-vjj-gold/20">
                  <Sparkles size={26} />
                </div>

                <div>
                  <p className="font-serif text-3xl font-bold leading-none text-vjj-black">
                    {BRAND.displayName}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-vjj-gold">
                    Verma ji jewellers
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-vjj-coffee">
                Premium jewellery collection with store support, WhatsApp
                enquiry, wishlist, cart, checkout and order tracking.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-vjj-champagne bg-white/80 text-vjj-bronze transition hover:bg-vjj-gold hover:text-white"
                  aria-label="Instagram"
                >
                  <Camera size={19} />
                </a>

                <a
                  href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                    message,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-700 transition hover:bg-green-600 hover:text-white"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={19} />
                </a>

                <a
                  href={`tel:${BRAND.phone}`}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-vjj-champagne bg-white/80 text-vjj-bronze transition hover:bg-vjj-gold hover:text-white"
                  aria-label="Phone"
                >
                  <Phone size={19} />
                </a>
              </div>
            </div>

            <FooterColumn title="Quick Links" links={quickLinks} />

            <FooterColumn title="Categories" links={customerLinks} />

            <div>
              <h3 className="font-serif text-2xl font-bold text-vjj-black">
                Contact Store
              </h3>

              <div className="mt-5 grid gap-3">
                <ContactItem
                  icon={<Phone size={18} />}
                  label={BRAND.phone}
                  href={`tel:${BRAND.phone}`}
                />

                <ContactItem
                  icon={<Mail size={18} />}
                  label={BRAND.customerEmail}
                  href={`mailto:${BRAND.customerEmail}`}
                />

                <ContactItem
                  icon={<MapPin size={18} />}
                  label="Store Location"
                  href={BRAND.mapUrl}
                  external
                />
              </div>

              <div className="mt-6 rounded-2xl border border-vjj-champagne bg-vjj-soft/70 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="shrink-0 text-vjj-bronze" size={21} />
                  <p className="text-sm leading-6 text-vjj-coffee">
                    For jewellery orders, store team will confirm details before
                    delivery or pickup.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-vjj-champagne/70 bg-white/45 px-6 py-5 md:px-8">
            <div className="flex flex-col justify-between gap-3 text-sm text-slate-500 md:flex-row md:items-center">
              <p>
                © {new Date().getFullYear()} {BRAND.displayName}. All rights
                reserved.
              </p>

              <p className="inline-flex items-center gap-1">
                Made with <Heart size={15} className="text-vjj-gold" /> by
                Surojit Manna
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h3 className="font-serif text-2xl font-bold text-vjj-black">{title}</h3>

      <div className="mt-5 grid gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="text-sm font-semibold text-vjj-coffee transition hover:translate-x-1 hover:text-vjj-bronze"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ContactItem({ icon, label, href, external = false }) {
  const className =
    "flex items-center gap-3 rounded-2xl border border-vjj-champagne bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-vjj-gold hover:text-white";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
      </a>
    );
  }

  return (
    <a href={href} className={className}>
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </a>
  );
}
