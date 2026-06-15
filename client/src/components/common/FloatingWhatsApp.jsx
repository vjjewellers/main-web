import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

import { BRAND } from "../../utils/constants";

export default function FloatingWhatsApp() {
  const [open, setOpen] = useState(false);

  const phone = String(BRAND.phone || "").replace(/\D/g, "");
  const whatsappPhone = phone.startsWith("91") ? phone : `91${phone}`;

  const message = `Hello ${BRAND.displayName},

I am interested in your jewellery collection. Kindly share more details.`;

  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-[90]">
      {open && (
        <div className="mb-4 w-[280px] rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-2xl">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-bold text-vjj-black">
                Need Help?
              </h3>
              <p className="mt-1 text-sm text-stone-600">
                Chat with us on WhatsApp for product enquiry, order support and
                store details.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-vjj-ivory p-1.5 text-vjj-black"
            >
              <X size={16} />
            </button>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="grid h-14 w-14 place-items-center rounded-full bg-green-600 text-white shadow-2xl transition hover:scale-105 hover:bg-green-700"
        aria-label="Open WhatsApp chat"
      >
        <MessageCircle size={26} />
      </button>
    </div>
  );
}
