import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../services/api";
import ProductCard from "../components/product/ProductCard";
import {
  addWishlistItem,
  removeWishlistItem,
  selectIsWishlisted,
} from "../features/wishlist/wishlistSlice";
import { formatCurrency } from "../utils/formatCurrency";
import { BRAND } from "../utils/constants";

const LIVE_SITE_URL = "https://vermajijewellers.com";

const fallbackImage =
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1100&q=90";

const optimizeImageUrl = (url, width = 1100) => {
  if (!url) return url;

  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,c_fill,w_${width}/`);
  }

  return url;
};

const normalizeImages = (product) => {
  const images = product?.images || [];

  if (!images.length && product?.image) {
    return [product.image];
  }

  const sorted = [...images].sort((a, b) => {
    if (a?.isPrimary) return -1;
    if (b?.isPrimary) return 1;
    return 0;
  });

  return sorted
    .map((item) => item?.url || item)
    .filter(Boolean)
    .slice(0, 6);
};

const getWhatsAppPhone = () => {
  const phone = String(BRAND.phone || "").replace(/\D/g, "");
  return phone.startsWith("91") ? phone : `91${phone}`;
};

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const isWishlisted = useSelector((state) =>
    product?._id ? selectIsWishlisted(state, product._id) : false,
  );

  const images = useMemo(() => {
    const productImages = normalizeImages(product);
    return productImages.length ? productImages : [fallbackImage];
  }, [product]);

  const activeImage = optimizeImageUrl(
    images[activeImageIndex] || images[0] || fallbackImage,
    1100,
  );

  const discount =
    product?.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100,
        )
      : 0;

  const productLink = product?.slug
    ? `${LIVE_SITE_URL}/products/${product.slug}`
    : LIVE_SITE_URL;

  const whatsappUrl = useMemo(() => {
    if (!product) return "#";

    const whatsappPhone = getWhatsAppPhone();

    const message = `Hello ${BRAND.displayName},

I am interested in this product:

Product: ${product.name}
SKU: ${product.sku || "N/A"}
Price: ${formatCurrency(product.price)}
Material: ${product.material || "N/A"}
Purity: ${product.purity || "N/A"}
Category: ${product.category || "Jewellery"}

Product Link:
${productLink}

Kindly share more details.`;

    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
  }, [product, productLink]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/products/${slug}`);
      const fetchedProduct = data.product || data;

      setProduct(fetchedProduct);
      setActiveImageIndex(0);

      if (fetchedProduct?.category) {
        const relatedResponse = await api.get("/products", {
          params: {
            category: fetchedProduct.category,
            limit: 8,
          },
        });

        const related =
          relatedResponse.data.products || relatedResponse.data || [];

        setRelatedProducts(
          related.filter((item) => item._id !== fetchedProduct._id).slice(0, 4),
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch product");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleWishlist = async () => {
    if (!product?._id) return;

    try {
      if (isWishlisted) {
        await dispatch(removeWishlistItem(product._id)).unwrap();
        toast.success("Removed from wishlist");
      } else {
        await dispatch(addWishlistItem(product._id)).unwrap();
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error(error || "Wishlist update failed");
    }
  };

  const goPrevImage = () => {
    setActiveImageIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const goNextImage = () => {
    setActiveImageIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return (
      <section className="px-4 py-16 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-[1200px] rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <h1 className="font-serif text-4xl font-bold text-slate-950">
            Product not found
          </h1>

          <Link
            to="/products"
            className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white"
          >
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <main className="bg-transparent">
      <section className="px-4 py-6 sm:px-5 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-[1500px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-blue-600 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] xl:gap-12">
            <div>
              <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-3 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
                <div className="relative overflow-hidden rounded-[1.5rem] bg-blue-50">
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="h-[430px] w-full object-cover sm:h-[560px] lg:h-[680px]"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goPrevImage}
                        className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-950 shadow-md transition hover:bg-blue-600 hover:text-white"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={22} />
                      </button>

                      <button
                        type="button"
                        onClick={goNextImage}
                        className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-950 shadow-md transition hover:bg-blue-600 hover:text-white"
                        aria-label="Next image"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}

                  <div className="absolute left-4 top-4 flex flex-col gap-2">
                    {discount > 0 && (
                      <span className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white">
                        {discount}% OFF
                      </span>
                    )}

                    {product.isFeatured && (
                      <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white">
                        Featured
                      </span>
                    )}

                    {product.readyToShip && (
                      <span className="rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white">
                        Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`overflow-hidden rounded-2xl border p-1 transition ${
                        activeImageIndex === index
                          ? "border-blue-600 bg-blue-50"
                          : "border-blue-100 bg-white hover:border-blue-300"
                      }`}
                    >
                      <img
                        src={optimizeImageUrl(image, 180)}
                        alt={`${product.name} ${index + 1}`}
                        className="h-20 w-full rounded-xl object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-7 lg:p-9">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  <Sparkles size={15} />
                  {product.category || "Jewellery"}
                </span>

                {product.productCollection && (
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">
                    {product.productCollection}
                  </span>
                )}

                <span
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    product.stock <= 0
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {product.stock <= 0 ? "Currently Unavailable" : "Available"}
                </span>
              </div>

              <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                {product.name}
              </h1>

              {product.shortDescription && (
                <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  {product.shortDescription}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-end gap-3">
                <p className="font-serif text-4xl font-bold text-slate-950">
                  {formatCurrency(product.price)}
                </p>

                {product.comparePrice > product.price && (
                  <p className="pb-1 text-lg font-semibold text-slate-400 line-through">
                    {formatCurrency(product.comparePrice)}
                  </p>
                )}
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Catalogue display only. Final availability and details can be
                confirmed directly with the store.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
                >
                  <MessageCircle size={19} />
                  Enquire on WhatsApp
                </a>

                <button
                  type="button"
                  onClick={handleWishlist}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-7 py-4 text-sm font-bold transition ${
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  <Heart
                    size={19}
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                  {isWishlisted ? "Saved" : "Save to Wishlist"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <a
                  href={`tel:${BRAND.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-100 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:bg-blue-600 hover:text-white"
                >
                  <Phone size={18} />
                  Call Store
                </a>

                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-100 bg-white px-7 py-4 text-sm font-bold text-slate-800 transition hover:bg-blue-600 hover:text-white"
                >
                  Browse More
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <TrustCard
                  icon={<BadgeCheck size={20} />}
                  title="Store Verified"
                  text="Enquire directly"
                />
                <TrustCard
                  icon={<Truck size={20} />}
                  title="Delivery"
                  text="Confirm with store"
                />
                <TrustCard
                  icon={<ShieldCheck size={20} />}
                  title="Support"
                  text="WhatsApp/call"
                />
              </div>

              <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-5 sm:grid-cols-2">
                <InfoRow label="SKU" value={product.sku || "N/A"} />
                <InfoRow label="Material" value={product.material || "N/A"} />
                <InfoRow label="Purity" value={product.purity || "N/A"} />
                <InfoRow label="Category" value={product.category || "N/A"} />
                <InfoRow
                  label="Occasion"
                  value={product.occasion || product.productType || "N/A"}
                />
                <InfoRow
                  label="Gender"
                  value={product.gender || "Unisex / N/A"}
                />
              </div>

              {(product.grossWeight ||
                product.netWeight ||
                product.makingCharge ||
                product.gstPercent) && (
                <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-blue-100 bg-white p-5 sm:grid-cols-2">
                  <InfoRow
                    label="Gross Weight"
                    value={
                      product.grossWeight ? `${product.grossWeight} g` : "N/A"
                    }
                  />
                  <InfoRow
                    label="Net Weight"
                    value={product.netWeight ? `${product.netWeight} g` : "N/A"}
                  />
                  <InfoRow
                    label="Making Charge"
                    value={
                      product.makingCharge
                        ? formatCurrency(product.makingCharge)
                        : "N/A"
                    }
                  />
                  <InfoRow
                    label="GST"
                    value={
                      product.gstPercent ? `${product.gstPercent}%` : "N/A"
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {(product.longDescription || product.description) && (
        <section className="px-4 pb-10 sm:px-5 lg:px-8">
          <div className="mx-auto max-w-[1500px] rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)] md:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-blue-700">
                <Info size={20} />
              </div>

              <h2 className="font-serif text-3xl font-bold text-slate-950">
                Product Details
              </h2>
            </div>

            <p className="mt-5 max-w-5xl whitespace-pre-line text-base leading-8 text-slate-600">
              {product.longDescription || product.description}
            </p>
          </div>
        </section>
      )}

      {Array.isArray(product.highlights) && product.highlights.length > 0 && (
        <section className="px-4 pb-10 sm:px-5 lg:px-8">
          <div className="mx-auto max-w-[1500px] rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.05)] md:p-8">
            <h2 className="font-serif text-3xl font-bold text-slate-950">
              Highlights
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {product.highlights.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4"
                >
                  <Star
                    size={18}
                    className="mt-1 shrink-0 text-blue-700"
                    fill="currentColor"
                  />
                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="px-4 pb-16 sm:px-5 lg:px-8">
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600">
                  Related Products
                </p>
                <h2 className="mt-2 font-serif text-4xl font-bold text-slate-950">
                  You may also like
                </h2>
              </div>

              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-blue-600 hover:text-white"
              >
                View All
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function TrustCard({ icon, title, text }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
      <div className="text-blue-700">{icon}</div>
      <p className="mt-3 text-sm font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{text}</p>
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <section className="px-4 py-10 sm:px-5 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-2">
        <div className="h-[620px] animate-pulse rounded-[2rem] bg-white" />
        <div className="h-[620px] animate-pulse rounded-[2rem] bg-white" />
      </div>
    </section>
  );
}
