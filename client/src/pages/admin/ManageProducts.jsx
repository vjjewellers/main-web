import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCcw,
  Package,
  Pencil,
  X,
  ImagePlus,
  Star,
  CheckCircle2,
  Layers,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { CATEGORIES } from "../../utils/constants";

const emptySpecGroups = [
  {
    title: "Metal Details",
    rows: [
      { label: "Metal", value: "" },
      { label: "Purity", value: "" },
      { label: "Metal Colour", value: "" },
      { label: "Gross Weight", value: "" },
      { label: "Net Weight", value: "" },
    ],
  },
  {
    title: "Stone Details",
    rows: [
      { label: "Stone Type", value: "" },
      { label: "Stone Colour", value: "" },
      { label: "Stone Weight", value: "" },
      { label: "Stone Count", value: "" },
    ],
  },
  {
    title: "General Details",
    rows: [
      { label: "Jewellery Type", value: "" },
      { label: "Product Type", value: "" },
      { label: "Collection", value: "" },
      { label: "Gender", value: "" },
      { label: "Occasion", value: "" },
    ],
  },
];

const initialForm = {
  name: "",
  sku: "",
  description: "",
  longDescription: "",
  category: "Rings",
  productType: "",
  productCollection: "",
  gender: "",
  occasion: "",
  material: "Gold",
  materialColor: "",
  purity: "22KT",
  grossWeight: "",
  netWeight: "",
  price: "",
  compareAtPrice: "",
  makingCharge: "",
  gstPercent: 3,
  stock: "",
  sizes: "",
  tags: "",
  highlights: "",
  careInstructions:
    "Store jewellery in a dry place. Avoid contact with perfume, water and chemicals. Clean gently with a soft cloth.",
  images: [],
  specificationGroups: emptySpecGroups,
  isFeatured: false,
  isReadyToShip: false,
};

const materialOptions = [
  "Gold",
  "Diamond",
  "Silver",
  "Platinum",
  "Rose Gold",
  "Gemstone",
];

const purityOptions = ["9KT", "14KT", "18KT", "22KT", "24KT", "925 Silver"];

const cloneInitialForm = () => ({
  ...initialForm,
  images: [],
  specificationGroups: JSON.parse(JSON.stringify(emptySpecGroups)),
});

const toCommaString = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
};

const commaToArray = (value) => {
  if (!value) return [];

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const cleanSpecGroups = (groups) => {
  if (!Array.isArray(groups)) return [];

  return groups
    .map((group) => ({
      title: String(group.title || "").trim(),
      rows: Array.isArray(group.rows)
        ? group.rows
            .map((row) => ({
              label: String(row.label || "").trim(),
              value: String(row.value || "").trim(),
            }))
            .filter((row) => row.label || row.value)
        : [],
    }))
    .filter((group) => group.title || group.rows.length > 0);
};

const getProductImage = (product) =>
  product.images?.find((image) => image.isPrimary)?.url ||
  product.images?.[0]?.url ||
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=90";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(cloneInitialForm());
  const [creating, setCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(cloneInitialForm());
  const [updating, setUpdating] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/products", {
        params: {
          limit: 100,
        },
      });

      setProducts(data.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const { data } = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      url: data.image.url,
      publicId: data.image.publicId || data.image.public_id || "",
      alt: "",
      isPrimary: false,
    };
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    if (form.images.length + files.length > 4) {
      toast.error("Maximum 4 product images are allowed");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);

      const uploadedImages = [];

      for (const file of files) {
        const uploaded = await uploadImageToCloudinary(file);
        uploadedImages.push(uploaded);
      }

      setForm((prev) => {
        const nextImages = [...prev.images, ...uploadedImages].slice(0, 4);

        return {
          ...prev,
          images: nextImages.map((image, index) => ({
            ...image,
            alt: image.alt || prev.name,
            isPrimary: index === 0 ? true : Boolean(image.isPrimary),
          })),
        };
      });

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleEditImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    if (editForm.images.length + files.length > 4) {
      toast.error("Maximum 4 product images are allowed");
      event.target.value = "";
      return;
    }

    try {
      setUploadingEditImage(true);

      const uploadedImages = [];

      for (const file of files) {
        const uploaded = await uploadImageToCloudinary(file);
        uploadedImages.push(uploaded);
      }

      setEditForm((prev) => {
        const nextImages = [...prev.images, ...uploadedImages].slice(0, 4);

        return {
          ...prev,
          images: nextImages.map((image, index) => ({
            ...image,
            alt: image.alt || prev.name,
            isPrimary: index === 0 ? true : Boolean(image.isPrimary),
          })),
        };
      });

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingEditImage(false);
      event.target.value = "";
    }
  };

  const removeImage = (index, mode = "create") => {
    const setter = mode === "edit" ? setEditForm : setForm;

    setter((prev) => {
      const images = prev.images.filter(
        (_, imageIndex) => imageIndex !== index,
      );

      return {
        ...prev,
        images: images.map((image, imageIndex) => ({
          ...image,
          isPrimary: imageIndex === 0 ? true : image.isPrimary,
        })),
      };
    });
  };

  const setPrimaryImage = (index, mode = "create") => {
    const setter = mode === "edit" ? setEditForm : setForm;

    setter((prev) => ({
      ...prev,
      images: prev.images.map((image, imageIndex) => ({
        ...image,
        isPrimary: imageIndex === index,
      })),
    }));
  };

  const updateSpecGroupTitle = (groupIndex, value, mode = "create") => {
    const setter = mode === "edit" ? setEditForm : setForm;

    setter((prev) => ({
      ...prev,
      specificationGroups: prev.specificationGroups.map((group, index) =>
        index === groupIndex ? { ...group, title: value } : group,
      ),
    }));
  };

  const updateSpecRow = (
    groupIndex,
    rowIndex,
    field,
    value,
    mode = "create",
  ) => {
    const setter = mode === "edit" ? setEditForm : setForm;

    setter((prev) => ({
      ...prev,
      specificationGroups: prev.specificationGroups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              rows: group.rows.map((row, currentRowIndex) =>
                currentRowIndex === rowIndex
                  ? {
                      ...row,
                      [field]: value,
                    }
                  : row,
              ),
            }
          : group,
      ),
    }));
  };

  const addSpecRow = (groupIndex, mode = "create") => {
    const setter = mode === "edit" ? setEditForm : setForm;

    setter((prev) => ({
      ...prev,
      specificationGroups: prev.specificationGroups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              rows: [...group.rows, { label: "", value: "" }],
            }
          : group,
      ),
    }));
  };

  const removeSpecRow = (groupIndex, rowIndex, mode = "create") => {
    const setter = mode === "edit" ? setEditForm : setForm;

    setter((prev) => ({
      ...prev,
      specificationGroups: prev.specificationGroups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              rows: group.rows.filter(
                (_, currentRowIndex) => currentRowIndex !== rowIndex,
              ),
            }
          : group,
      ),
    }));
  };

  const addSpecGroup = (mode = "create") => {
    const setter = mode === "edit" ? setEditForm : setForm;

    setter((prev) => ({
      ...prev,
      specificationGroups: [
        ...prev.specificationGroups,
        {
          title: "Custom Details",
          rows: [{ label: "", value: "" }],
        },
      ],
    }));
  };

  const removeSpecGroup = (groupIndex, mode = "create") => {
    const setter = mode === "edit" ? setEditForm : setForm;

    setter((prev) => ({
      ...prev,
      specificationGroups: prev.specificationGroups.filter(
        (_, index) => index !== groupIndex,
      ),
    }));
  };

  const buildPayload = (sourceForm) => ({
    name: sourceForm.name,
    sku: sourceForm.sku,
    description: sourceForm.description,
    longDescription: sourceForm.longDescription,
    category: sourceForm.category,
    productType: sourceForm.productType,
    productCollection: sourceForm.productCollection,
    gender: sourceForm.gender,
    occasion: sourceForm.occasion,
    material: sourceForm.material,
    materialColor: sourceForm.materialColor,
    purity: sourceForm.purity,
    grossWeight: sourceForm.grossWeight,
    netWeight: sourceForm.netWeight,
    price: Number(sourceForm.price),
    compareAtPrice: Number(sourceForm.compareAtPrice || 0),
    makingCharge: Number(sourceForm.makingCharge || 0),
    gstPercent: Number(sourceForm.gstPercent || 3),
    stock: Number(sourceForm.stock || 0),
    sizes: commaToArray(sourceForm.sizes),
    tags: commaToArray(sourceForm.tags),
    highlights: commaToArray(sourceForm.highlights),
    careInstructions: sourceForm.careInstructions,
    images: sourceForm.images.slice(0, 4).map((image, index) => ({
      ...image,
      alt: image.alt || sourceForm.name,
      isPrimary: image.isPrimary || index === 0,
    })),
    specificationGroups: cleanSpecGroups(sourceForm.specificationGroups),
    isFeatured: sourceForm.isFeatured,
    isReadyToShip: sourceForm.isReadyToShip,
  });

  const validateForm = (sourceForm) => {
    if (
      !sourceForm.name ||
      !sourceForm.sku ||
      !sourceForm.description ||
      !sourceForm.price
    ) {
      toast.error("Please fill name, SKU, short description and price");
      return false;
    }

    if (sourceForm.images.length > 4) {
      toast.error("Maximum 4 product images are allowed");
      return false;
    }

    return true;
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();

    if (!validateForm(form)) return;

    try {
      setCreating(true);

      await api.post("/products/admin", buildPayload(form));

      toast.success("Product created successfully");

      setForm(cloneInitialForm());
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Product creation failed");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/admin/${productId}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setEditForm({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      longDescription: product.longDescription || "",
      category: product.category || "Rings",
      productType: product.productType || "",
      productCollection: product.productCollection || product.collection || "",
      gender: product.gender || "",
      occasion: product.occasion || "",
      material: product.material || "Gold",
      materialColor: product.materialColor || "",
      purity: product.purity || "22KT",
      grossWeight: product.grossWeight || "",
      netWeight: product.netWeight || "",
      price: product.price || "",
      compareAtPrice: product.compareAtPrice || "",
      makingCharge: product.makingCharge || product.makingCharges || "",
      gstPercent: product.gstPercent || product.taxRate || 3,
      stock: product.stock || "",
      sizes: toCommaString(product.sizes),
      tags: toCommaString(product.tags),
      highlights: toCommaString(product.highlights),
      careInstructions:
        product.careInstructions || initialForm.careInstructions,
      images: product.images || [],
      specificationGroups:
        product.specificationGroups?.length > 0
          ? product.specificationGroups
          : JSON.parse(JSON.stringify(emptySpecGroups)),
      isFeatured: Boolean(product.isFeatured),
      isReadyToShip: Boolean(product.isReadyToShip),
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm(cloneInitialForm());
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (!editingProduct) return;
    if (!validateForm(editForm)) return;

    try {
      setUpdating(true);

      await api.patch(
        `/products/admin/${editingProduct._id}`,
        buildPayload(editForm),
      );

      toast.success("Product updated successfully");

      closeEditModal();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Product update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            Admin Products
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
            Manage Products
          </h1>
          <p className="mt-3 max-w-2xl text-stone-600">
            Add jewellery products with images, advanced details, pricing,
            stock, specification table and visibility.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <ProductForm
          title="Add Product"
          subtitle="Upload up to 4 images and add product details."
          form={form}
          mode="create"
          creating={creating}
          uploadingImage={uploadingImage}
          onChange={handleChange}
          onSubmit={handleCreateProduct}
          onImageUpload={handleImageUpload}
          removeImage={removeImage}
          setPrimaryImage={setPrimaryImage}
          updateSpecGroupTitle={updateSpecGroupTitle}
          updateSpecRow={updateSpecRow}
          addSpecRow={addSpecRow}
          removeSpecRow={removeSpecRow}
          addSpecGroup={addSpecGroup}
          removeSpecGroup={removeSpecGroup}
        />

        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold">Products</h2>
              <p className="mt-1 text-sm text-stone-600">
                Total products: {products.length}
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
              <Package />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-3xl bg-vjj-ivory"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl bg-vjj-ivory p-8 text-center">
              <h3 className="font-serif text-2xl font-bold">
                No products found
              </h3>
              <p className="mt-2 text-stone-600">
                Create your first product from the form.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => {
                const image = getProductImage(product);

                return (
                  <div
                    key={product._id}
                    className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-vjj-ivory p-4 md:flex-row md:items-center"
                  >
                    <img
                      src={image}
                      alt={product.name}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-vjj-bronze">
                        {product.category} · {product.material}
                      </p>

                      <h3 className="mt-1 line-clamp-1 font-serif text-2xl font-bold">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-600">
                        <span>SKU: {product.sku}</span>
                        <span>Stock: {product.stock}</span>
                        <span>{formatCurrency(product.price)}</span>
                        <span>{product.images?.length || 0}/4 Images</span>

                        {product.isFeatured && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                            Featured
                          </span>
                        )}

                        {product.isReadyToShip && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">
                            Ready
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/products/${product.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-vjj-black transition hover:bg-vjj-ivory"
                      >
                        <ExternalLink size={16} />
                        View
                      </a>

                      <button
                        onClick={() => openEditModal(product)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-vjj-black transition hover:bg-vjj-black hover:text-white"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 px-5 py-10 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
                  Edit Product
                </p>
                <h2 className="mt-2 font-serif text-4xl font-bold text-vjj-black">
                  {editingProduct.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full border border-black/10 p-2 transition hover:bg-vjj-ivory"
              >
                <X size={20} />
              </button>
            </div>

            <ProductForm
              title=""
              subtitle=""
              form={editForm}
              mode="edit"
              creating={updating}
              uploadingImage={uploadingEditImage}
              onChange={handleEditChange}
              onSubmit={handleUpdateProduct}
              onImageUpload={handleEditImageUpload}
              removeImage={removeImage}
              setPrimaryImage={setPrimaryImage}
              updateSpecGroupTitle={updateSpecGroupTitle}
              updateSpecRow={updateSpecRow}
              addSpecRow={addSpecRow}
              removeSpecRow={removeSpecRow}
              addSpecGroup={addSpecGroup}
              removeSpecGroup={removeSpecGroup}
              showHeader={false}
            />

            <button
              type="button"
              onClick={closeEditModal}
              className="mt-4 w-full rounded-full border border-black/10 bg-white px-6 py-4 text-sm font-bold text-vjj-black transition hover:bg-vjj-ivory"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({
  title,
  subtitle,
  form,
  mode,
  creating,
  uploadingImage,
  onChange,
  onSubmit,
  onImageUpload,
  removeImage,
  setPrimaryImage,
  updateSpecGroupTitle,
  updateSpecRow,
  addSpecRow,
  removeSpecRow,
  addSpecGroup,
  removeSpecGroup,
  showHeader = true,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="h-fit rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
    >
      {showHeader && (
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
            <Plus />
          </div>

          <div>
            <h2 className="font-serif text-3xl font-bold">{title}</h2>
            <p className="text-sm text-stone-600">{subtitle}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        <FormSection title="Basic Details">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Product name"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
            required
          />

          <input
            name="sku"
            value={form.sku}
            onChange={onChange}
            placeholder="SKU e.g. VJJ-RING-002"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
            required
          />

          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Short product description"
            rows="3"
            className="resize-none rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold md:col-span-2"
            required
          />

          <textarea
            name="longDescription"
            value={form.longDescription}
            onChange={onChange}
            placeholder="Long product description for product details page"
            rows="5"
            className="resize-none rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold md:col-span-2"
          />
        </FormSection>

        <FormSection title="Classification">
          <select
            name="category"
            value={form.category}
            onChange={onChange}
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            name="productType"
            value={form.productType}
            onChange={onChange}
            placeholder="Product Type e.g. Drop Earrings"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          />

          <input
            name="productCollection"
            value={form.productCollection}
            onChange={onChange}
            placeholder="Collection e.g. Bridal / Daily Wear"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          />

          <input
            name="gender"
            value={form.gender}
            onChange={onChange}
            placeholder="Gender e.g. Women"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          />

          <input
            name="occasion"
            value={form.occasion}
            onChange={onChange}
            placeholder="Occasion e.g. Wedding / Office"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold md:col-span-2"
          />
        </FormSection>

        <FormSection title="Metal & Weight">
          <select
            name="material"
            value={form.material}
            onChange={onChange}
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          >
            {materialOptions.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>

          <select
            name="purity"
            value={form.purity}
            onChange={onChange}
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          >
            {purityOptions.map((purity) => (
              <option key={purity} value={purity}>
                {purity}
              </option>
            ))}
          </select>

          <input
            name="materialColor"
            value={form.materialColor}
            onChange={onChange}
            placeholder="Material Colour e.g. Yellow"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          />

          <input
            name="grossWeight"
            value={form.grossWeight}
            onChange={onChange}
            placeholder="Gross Weight e.g. 4.25g"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          />

          <input
            name="netWeight"
            value={form.netWeight}
            onChange={onChange}
            placeholder="Net Weight e.g. 3.95g"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold md:col-span-2"
          />
        </FormSection>

        <FormSection title="Price & Stock">
          <input
            name="price"
            value={form.price}
            onChange={onChange}
            placeholder="Selling Price"
            type="number"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
            required
          />

          <input
            name="compareAtPrice"
            value={form.compareAtPrice}
            onChange={onChange}
            placeholder="MRP / Compare Price"
            type="number"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          />

          <input
            name="makingCharge"
            value={form.makingCharge}
            onChange={onChange}
            placeholder="Making Charge"
            type="number"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          />

          <input
            name="gstPercent"
            value={form.gstPercent}
            onChange={onChange}
            placeholder="GST %"
            type="number"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          />

          <input
            name="stock"
            value={form.stock}
            onChange={onChange}
            placeholder="Stock"
            type="number"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold md:col-span-2"
          />
        </FormSection>

        <ProductImagesSection
          images={form.images}
          mode={mode}
          uploadingImage={uploadingImage}
          onImageUpload={onImageUpload}
          removeImage={removeImage}
          setPrimaryImage={setPrimaryImage}
        />

        <FormSection title="Size, Tags & Highlights">
          <input
            name="sizes"
            value={form.sizes}
            onChange={onChange}
            placeholder="Sizes comma separated e.g. 12,14,16"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          />

          <input
            name="tags"
            value={form.tags}
            onChange={onChange}
            placeholder="Tags comma separated e.g. gold,wedding,premium"
            className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
          />

          <textarea
            name="highlights"
            value={form.highlights}
            onChange={onChange}
            placeholder="Highlights comma separated e.g. BIS Hallmarked, Premium Finish, Secure Packaging"
            rows="3"
            className="resize-none rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold md:col-span-2"
          />
        </FormSection>

        <FormSection title="Care Instructions">
          <textarea
            name="careInstructions"
            value={form.careInstructions}
            onChange={onChange}
            placeholder="Care instructions"
            rows="4"
            className="resize-none rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold md:col-span-2"
          />
        </FormSection>

        <SpecificationEditor
          groups={form.specificationGroups}
          mode={mode}
          updateSpecGroupTitle={updateSpecGroupTitle}
          updateSpecRow={updateSpecRow}
          addSpecRow={addSpecRow}
          removeSpecRow={removeSpecRow}
          addSpecGroup={addSpecGroup}
          removeSpecGroup={removeSpecGroup}
        />

        <div className="grid gap-3 rounded-2xl bg-vjj-ivory p-4">
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={onChange}
            />
            Featured / Signature Product
          </label>

          <label className="flex items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              name="isReadyToShip"
              checked={form.isReadyToShip}
              onChange={onChange}
            />
            Ready To Ship
          </label>
        </div>

        <button
          disabled={creating}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-4 text-sm font-bold text-white transition hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={18} />
          {creating
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
              ? "Update Product"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}

function FormSection({ title, children }) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-4">
      <h3 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold text-vjj-black">
        <Layers size={20} className="text-vjj-bronze" />
        {title}
      </h3>

      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function ProductImagesSection({
  images,
  mode,
  uploadingImage,
  onImageUpload,
  removeImage,
  setPrimaryImage,
}) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-vjj-ivory p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-bold text-vjj-black">
            Product Images
          </h3>
          <p className="mt-1 text-sm text-stone-600">
            Upload maximum 4 images. First/primary image appears first.
          </p>
        </div>

        <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-vjj-bronze">
          {images.length}/4
        </span>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-vjj-bronze/50 bg-white px-5 py-8 text-center transition hover:bg-vjj-ivory">
        <ImagePlus className="text-vjj-bronze" size={34} />
        <p className="mt-3 font-bold text-vjj-black">
          {uploadingImage ? "Uploading..." : "Upload Images"}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          JPG, PNG, WEBP. You can select multiple images.
        </p>

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          disabled={uploadingImage || images.length >= 4}
          onChange={onImageUpload}
          className="hidden"
        />
      </label>

      {images.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="rounded-2xl border border-black/10 bg-white p-3"
            >
              <img
                src={image.url}
                alt={image.alt || "Product"}
                className="h-44 w-full rounded-xl object-cover"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPrimaryImage(index, mode)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                    image.isPrimary
                      ? "bg-vjj-black text-vjj-champagne"
                      : "bg-vjj-ivory text-vjj-black"
                  }`}
                >
                  {image.isPrimary ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Star size={14} />
                  )}
                  {image.isPrimary ? "Primary" : "Set Primary"}
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(index, mode)}
                  className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpecificationEditor({
  groups,
  mode,
  updateSpecGroupTitle,
  updateSpecRow,
  addSpecRow,
  removeSpecRow,
  addSpecGroup,
  removeSpecGroup,
}) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-4">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-serif text-2xl font-bold text-vjj-black">
            Product Specification Table
          </h3>
          <p className="mt-1 text-sm text-stone-600">
            These details will appear on the single product page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => addSpecGroup(mode)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-4 py-2 text-sm font-bold text-white"
        >
          <Plus size={16} />
          Add Group
        </button>
      </div>

      <div className="grid gap-5">
        {groups.map((group, groupIndex) => (
          <div
            key={`${group.title}-${groupIndex}`}
            className="rounded-2xl border border-black/10 bg-vjj-ivory p-4"
          >
            <div className="mb-4 flex gap-3">
              <input
                value={group.title}
                onChange={(event) =>
                  updateSpecGroupTitle(groupIndex, event.target.value, mode)
                }
                placeholder="Group title e.g. Metal Details"
                className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-vjj-gold"
              />

              <button
                type="button"
                onClick={() => removeSpecGroup(groupIndex, mode)}
                className="rounded-full bg-red-50 p-3 text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid gap-3">
              {group.rows.map((row, rowIndex) => (
                <div
                  key={`${row.label}-${rowIndex}`}
                  className="grid gap-3 md:grid-cols-[0.9fr_1.1fr_auto]"
                >
                  <input
                    value={row.label}
                    onChange={(event) =>
                      updateSpecRow(
                        groupIndex,
                        rowIndex,
                        "label",
                        event.target.value,
                        mode,
                      )
                    }
                    placeholder="Label e.g. Gross Weight"
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-vjj-gold"
                  />

                  <input
                    value={row.value}
                    onChange={(event) =>
                      updateSpecRow(
                        groupIndex,
                        rowIndex,
                        "value",
                        event.target.value,
                        mode,
                      )
                    }
                    placeholder="Value e.g. 4.25g"
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-vjj-gold"
                  />

                  <button
                    type="button"
                    onClick={() => removeSpecRow(groupIndex, rowIndex, mode)}
                    className="rounded-full bg-red-50 px-4 py-3 text-red-700"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addSpecRow(groupIndex, mode)}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-vjj-black"
            >
              <Plus size={15} />
              Add Row
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
