import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../services/api";
import { addCartItem } from "../features/cart/cartSlice";
import { formatCurrency } from "../utils/formatCurrency";
import { BRAND } from "../utils/constants";

const getPrimaryImage = (product) => {
  return (
    product?.images?.find((image) => image.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    product?.image ||
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=90"
  );
};

const getGalleryImages = (product) => {
  const images = product?.images?.length
    ? product.images.map((image) => image.url || image).filter(Boolean)
    : [product?.image].filter(Boolean);

  if (images.length === 0) {
    return [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=90",
    ];
  }

  return images.slice(0, 4);
};

const getSpecGroups = (product) => {
  if (product?.specificationGroups?.length) {
    return product.specificationGroups;
  }

  return [
    {
      title: "Product Details",
      rows: [
        { label: "SKU", value: product?.sku },
        { label: "Category", value: product?.category },
        { label: "Product Type", value: product?.productType },
        { label: "Collection", value: product?.productCollection },
        { label: "Gender", value: product?.gender },
        { label: "Occasion", value: product?.occasion },
      ].filter((row) => row.value),
    },
    {
      title: "Metal Details",
      rows: [
        { label: "Material", value: product?.material },
        { label: "Purity", value: product?.purity },
        { label: "Material Color", value: product?.materialColor },
        { label: "Gross Weight", value: product?.grossWeight },
        { label: "Net Weight", value: product?.netWeight },
      ].filter((row) => row.value),
    },
  ].filter((group) => group.rows.length > 0);
};

export default function ProductDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [openSection, setOpenSection] = useState("details");

  const galleryImages = useMemo(() => getGalleryImages(product), [product]);
  const specGroups = useMemo(() => getSpecGroups(product), [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(`/products/${slug}`);
      const fetchedProduct = data.product || data;

      setProduct(fetchedProduct);
      setSelectedImage(getPrimaryImage(fetchedProduct));

      if (fetchedProduct?.sizes?.length) {
        setSelectedSize(fetchedProduct.sizes[0]);
      }

      if (fetchedProduct?.material) {
        setSelectedMaterial(fetchedProduct.material);
      }

      if (fetchedProduct?.category) {
        const relatedRes = await api.get("/products", {
          params: {
            category: fetchedProduct.category,
            limit: 4,
          },
        });

        const relatedData = relatedRes.data.products || relatedRes.data || [];

        setRelatedProducts(
          relatedData
            .filter((item) => item._id !== fetchedProduct._id)
            .slice(0, 4),
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      setAdding(true);

      await dispatch(
        addCartItem({
          productId: product._id,
          quantity,
          selectedSize,
          selectedMaterial,
        }),
      ).unwrap();

      toast.success("Added to cart");
    } catch (error) {
      toast.error(error || "Unable to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      setAdding(true);

      await dispatch(
        addCartItem({
          productId: product._id,
          quantity,
          selectedSize,
          selectedMaterial,
        }),
      ).unwrap();

      navigate("/checkout");
    } catch (error) {
      toast.error(error || "Unable to proceed");
    } finally {
      setAdding(false);
    }
  };

  const handleWhatsAppEnquiry = () => {
    if (!product) return;

    const phone = String(BRAND.phone || "").replace(/\D/g, "");
    const whatsappPhone = phone.startsWith("91") ? phone : `91${phone}`;

    const productUrl = window.location.href;

    const message = `Hello ${BRAND.displayName},

I am interested in this product:

Product: ${product.name}
SKU: ${product.sku || "N/A"}
Price: ${formatCurrency(product.price)}
Material: ${product.material || "N/A"}
Purity: ${product.purity || "N/A"}

Product Link:
${productUrl}

Kindly share more details.`;

    window.open(
      `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const increaseQuantity = () => {
    const stock = Number(product?.stock || 1);

    setQuantity((prev) => {
      if (prev >= stock) {
        toast.error(`Only ${stock} item available`);
        return prev;
      }

      return prev + 1;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? "" : section));
  };

  if (loading) {
    return (
      <section className="bg-vjj-ivory px-5 py-10 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="h-[620px] animate-pulse rounded-[2rem] bg-white" />
          <div className="space-y-5">
            <div className="h-12 animate-pulse rounded-full bg-white" />
            <div className="h-20 animate-pulse rounded-[2rem] bg-white" />
            <div className="h-44 animate-pulse rounded-[2rem] bg-white" />
            <div className="h-72 animate-pulse rounded-[2rem] bg-white" />
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="grid min-h-[70vh] place-items-center bg-vjj-ivory px-5">
        <div className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="font-serif text-4xl font-bold text-vjj-black">
            Product Not Found
          </h1>

          <p className="mt-3 text-stone-600">
            The product you are looking for is unavailable.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-bold text-white transition hover:bg-vjj-bronze"
          >
            <ArrowLeft size={17} />
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100,
        )
      : 0;

  return (
    <section className="bg-vjj-ivory px-5 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/products"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Products
        </Link>

        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white p-4 shadow-sm">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-vjj-ivory">
                <img
                  src={selectedImage || getPrimaryImage(product)}
                  alt={product.name}
                  className="h-[430px] w-full object-cover md:h-[620px]"
                />

                {discount > 0 && (
                  <div className="absolute left-4 top-4 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
                    {discount}% OFF
                  </div>
                )}

                {product.isFeatured && (
                  <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-vjj-black px-4 py-2 text-sm font-bold text-vjj-champagne">
                    <Sparkles size={15} />
                    Featured
                  </div>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`overflow-hidden rounded-2xl border bg-vjj-ivory p-1 transition ${
                        selectedImage === image
                          ? "border-vjj-bronze"
                          : "border-black/10 hover:border-vjj-bronze"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-20 w-full rounded-xl object-cover md:h-28"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm md:p-7">
              <div className="flex flex-wrap items-center gap-2">
                {product.category && (
                  <span className="rounded-full bg-vjj-ivory px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-vjj-bronze">
                    {product.category}
                  </span>
                )}

                {product.readyToShip && (
                  <span className="rounded-full bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                    Ready To Ship
                  </span>
                )}

                {product.stock <= 0 && (
                  <span className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-red-700">
                    Out of Stock
                  </span>
                )}
              </div>

              <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-vjj-black md:text-6xl">
                {product.name}
              </h1>

              {product.sku && (
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                  SKU: {product.sku}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <p className="font-serif text-5xl font-bold text-vjj-black">
                  {formatCurrency(product.price)}
                </p>

                {product.comparePrice > product.price && (
                  <p className="pb-1 text-xl font-semibold text-stone-400 line-through">
                    {formatCurrency(product.comparePrice)}
                  </p>
                )}

                {discount > 0 && (
                  <span className="mb-1 rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
                    Save {discount}%
                  </span>
                )}
              </div>

              {product.description && (
                <p className="mt-5 text-base leading-7 text-stone-600">
                  {product.description}
                </p>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MiniFeature
                  icon={<ShieldCheck size={19} />}
                  title="Certified"
                  text="Trusted quality"
                />

                <MiniFeature
                  icon={<Truck size={19} />}
                  title="Store Support"
                  text="Delivery assistance"
                />

                <MiniFeature
                  icon={<CheckCircle2 size={19} />}
                  title="Secure Order"
                  text="Easy checkout"
                />
              </div>

              <div className="mt-7 grid gap-5">
                {product.sizes?.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-bold text-vjj-black">
                      Select Size
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                            selectedSize === size
                              ? "border-vjj-black bg-vjj-black text-white"
                              : "border-black/10 bg-vjj-ivory text-vjj-black hover:border-vjj-bronze"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-3 text-sm font-bold text-vjj-black">
                    Quantity
                  </p>

                  <div className="inline-flex items-center rounded-full border border-black/10 bg-vjj-ivory p-1">
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white text-vjj-black transition hover:bg-vjj-black hover:text-white"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="grid h-10 w-14 place-items-center text-sm font-bold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white text-vjj-black transition hover:bg-vjj-black hover:text-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-stone-500">
                    Available stock: {product.stock}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding || product.stock <= 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-4 text-sm font-bold text-white transition hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  <ShoppingBag size={18} />
                  {adding ? "Adding..." : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={adding || product.stock <= 0}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-vjj-champagne px-6 py-4 text-sm font-bold text-vjj-black transition hover:bg-vjj-gold disabled:cursor-not-allowed disabled:bg-stone-200"
                >
                  Buy Now
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppEnquiry}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-green-600 bg-green-50 px-6 py-4 text-sm font-bold text-green-700 transition hover:bg-green-600 hover:text-white"
                >
                  <MessageCircle size={18} />
                  Enquire on WhatsApp
                </button>

                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-4 text-sm font-bold text-vjj-black transition hover:bg-vjj-black hover:text-white"
                >
                  <Heart size={18} />
                  Add to Wishlist
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm md:p-7">
              <AccordionSection
                title="Jewellery Details"
                open={openSection === "details"}
                onClick={() => toggleSection("details")}
              >
                {specGroups.length === 0 ? (
                  <p className="text-sm text-stone-600">
                    Detailed specifications will be updated shortly.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {specGroups.map((group, groupIndex) => (
                      <div key={`${group.title}-${groupIndex}`}>
                        <h3 className="mb-3 font-serif text-2xl font-bold text-vjj-black">
                          {group.title}
                        </h3>

                        <div className="overflow-hidden rounded-2xl border border-black/10">
                          {group.rows?.map((row, rowIndex) => (
                            <div
                              key={`${row.label}-${rowIndex}`}
                              className="grid grid-cols-[0.9fr_1.1fr] border-b border-black/10 last:border-b-0"
                            >
                              <div className="bg-vjj-ivory px-4 py-3 text-sm font-bold text-vjj-black">
                                {row.label}
                              </div>

                              <div className="px-4 py-3 text-sm text-stone-700">
                                {row.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionSection>

              <AccordionSection
                title="Description"
                open={openSection === "description"}
                onClick={() => toggleSection("description")}
              >
                <p className="text-sm leading-7 text-stone-600">
                  {product.longDescription ||
                    product.description ||
                    "Product description will be updated shortly."}
                </p>
              </AccordionSection>

              <AccordionSection
                title="Care Instructions"
                open={openSection === "care"}
                onClick={() => toggleSection("care")}
              >
                <p className="text-sm leading-7 text-stone-600">
                  {product.careInstructions ||
                    "Keep jewellery away from perfume, water and harsh chemicals. Store separately in a soft pouch or box after use."}
                </p>
              </AccordionSection>

              {product.highlights?.length > 0 && (
                <AccordionSection
                  title="Highlights"
                  open={openSection === "highlights"}
                  onClick={() => toggleSection("highlights")}
                >
                  <ul className="grid gap-3">
                    {product.highlights.map((highlight, index) => (
                      <li
                        key={`${highlight}-${index}`}
                        className="flex gap-3 rounded-2xl bg-vjj-ivory p-3 text-sm text-stone-700"
                      >
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-vjj-bronze"
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </AccordionSection>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
                  More From Collection
                </p>

                <h2 className="mt-2 font-serif text-4xl font-bold text-vjj-black">
                  Related Products
                </h2>
              </div>

              <Link
                to="/products"
                className="hidden rounded-full bg-vjj-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-vjj-bronze md:inline-flex"
              >
                View All
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item._id}
                  to={`/products/${item.slug}`}
                  className="group rounded-[2rem] border border-black/10 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-luxury"
                >
                  <div className="overflow-hidden rounded-[1.5rem] bg-vjj-ivory">
                    <img
                      src={getPrimaryImage(item)}
                      alt={item.name}
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-3">
                    <p className="line-clamp-1 font-serif text-xl font-bold text-vjj-black">
                      {item.name}
                    </p>

                    <p className="mt-1 text-sm font-bold text-vjj-bronze">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function MiniFeature({ icon, title, text }) {
  return (
    <div className="rounded-2xl bg-vjj-ivory p-4">
      <div className="mb-3 text-vjj-bronze">{icon}</div>
      <p className="font-bold text-vjj-black">{title}</p>
      <p className="mt-1 text-xs text-stone-500">{text}</p>
    </div>
  );
}

function AccordionSection({ title, open, onClick, children }) {
  return (
    <div className="border-b border-black/10 py-5 last:border-b-0">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="font-serif text-2xl font-bold text-vjj-black">
          {title}
        </span>

        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {open && <div className="mt-5">{children}</div>}
    </div>
  );
}
