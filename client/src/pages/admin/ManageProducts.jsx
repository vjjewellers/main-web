import { useEffect, useState } from "react";
import { Plus, Trash2, RefreshCcw, Package, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { CATEGORIES } from "../../utils/constants";

const initialForm = {
  name: "",
  sku: "",
  description: "",
  category: "Rings",
  material: "Gold",
  purity: "22KT",
  price: "",
  compareAtPrice: "",
  makingCharges: "",
  taxRate: 3,
  stock: "",
  sizes: "",
  imageUrl: "",
  tags: "",
  isFeatured: false,
  isReadyToShip: false,
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(initialForm);
  const [creating, setCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
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

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("image", file);

      const { data } = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setForm((prev) => ({
        ...prev,
        imageUrl: data.image.url,
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();

    if (!form.name || !form.sku || !form.description || !form.price) {
      toast.error("Please fill name, SKU, description and price");
      return;
    }

    try {
      setCreating(true);

      const payload = {
        name: form.name,
        sku: form.sku,
        description: form.description,
        category: form.category,
        material: form.material,
        purity: form.purity,
        price: Number(form.price),
        compareAtPrice: Number(form.compareAtPrice || 0),
        makingCharges: Number(form.makingCharges || 0),
        taxRate: Number(form.taxRate || 3),
        stock: Number(form.stock || 0),
        sizes: form.sizes
          ? form.sizes
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        images: form.imageUrl
          ? [
              {
                url: form.imageUrl,
                alt: form.name,
                isPrimary: true,
              },
            ]
          : [],
        tags: form.tags
          ? form.tags
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        isFeatured: form.isFeatured,
        isReadyToShip: form.isReadyToShip,
      };

      await api.post("/products/admin", payload);

      toast.success("Product created successfully");

      setForm(initialForm);
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
      category: product.category || "Rings",
      material: product.material || "Gold",
      purity: product.purity || "22KT",
      price: product.price || "",
      compareAtPrice: product.compareAtPrice || "",
      makingCharges: product.makingCharges || "",
      taxRate: product.taxRate || 3,
      stock: product.stock || "",
      sizes: product.sizes?.join(", ") || "",
      imageUrl: product.images?.[0]?.url || "",
      tags: product.tags?.join(", ") || "",
      isFeatured: Boolean(product.isFeatured),
      isReadyToShip: Boolean(product.isReadyToShip),
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm(initialForm);
  };

  const handleEditChange = (event) => {
    const { name, value, type, checked } = event.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingEditImage(true);

      const formData = new FormData();
      formData.append("image", file);

      const { data } = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setEditForm((prev) => ({
        ...prev,
        imageUrl: data.image.url,
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingEditImage(false);
    }
  };

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (!editingProduct) return;

    if (
      !editForm.name ||
      !editForm.sku ||
      !editForm.description ||
      !editForm.price
    ) {
      toast.error("Please fill name, SKU, description and price");
      return;
    }

    try {
      setUpdating(true);

      const payload = {
        name: editForm.name,
        sku: editForm.sku,
        description: editForm.description,
        category: editForm.category,
        material: editForm.material,
        purity: editForm.purity,
        price: Number(editForm.price),
        compareAtPrice: Number(editForm.compareAtPrice || 0),
        makingCharges: Number(editForm.makingCharges || 0),
        taxRate: Number(editForm.taxRate || 3),
        stock: Number(editForm.stock || 0),
        sizes: editForm.sizes
          ? editForm.sizes
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        images: editForm.imageUrl
          ? [
              {
                url: editForm.imageUrl,
                alt: editForm.name,
                isPrimary: true,
              },
            ]
          : [],
        tags: editForm.tags
          ? editForm.tags
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        isFeatured: editForm.isFeatured,
        isReadyToShip: editForm.isReadyToShip,
      };

      await api.patch(`/products/admin/${editingProduct._id}`, payload);

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
            Add jewellery products, manage pricing, stock, images and
            visibility.
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

      <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <form
          onSubmit={handleCreateProduct}
          className="h-fit rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
              <Plus />
            </div>

            <div>
              <h2 className="font-serif text-3xl font-bold">Add Product</h2>
              <p className="text-sm text-stone-600">
                Upload image and add product details.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product name"
              className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              required
            />

            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="SKU e.g. VJJ-RING-002"
              className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              required
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description"
              rows="4"
              className="resize-none rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              required
            />

            <div className="grid gap-4 md:grid-cols-2">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                name="material"
                value={form.material}
                onChange={handleChange}
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              >
                <option value="Gold">Gold</option>
                <option value="Diamond">Diamond</option>
                <option value="Silver">Silver</option>
                <option value="Platinum">Platinum</option>
                <option value="Rose Gold">Rose Gold</option>
                <option value="Gemstone">Gemstone</option>
              </select>

              <select
                name="purity"
                value={form.purity}
                onChange={handleChange}
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              >
                <option value="9KT">9KT</option>
                <option value="14KT">14KT</option>
                <option value="18KT">18KT</option>
                <option value="22KT">22KT</option>
                <option value="24KT">24KT</option>
                <option value="925 Silver">925 Silver</option>
              </select>

              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Stock"
                type="number"
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                type="number"
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                required
              />

              <input
                name="compareAtPrice"
                value={form.compareAtPrice}
                onChange={handleChange}
                placeholder="MRP"
                type="number"
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              />

              <input
                name="makingCharges"
                value={form.makingCharges}
                onChange={handleChange}
                placeholder="Making"
                type="number"
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              />
            </div>

            <div className="rounded-2xl border border-black/10 bg-vjj-ivory p-4">
              <label className="mb-3 block text-sm font-bold text-vjj-black">
                Product Image
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageUpload}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm"
              />

              {uploadingImage && (
                <p className="mt-3 text-sm font-semibold text-vjj-bronze">
                  Uploading image...
                </p>
              )}

              {form.imageUrl && (
                <div className="mt-4">
                  <img
                    src={form.imageUrl}
                    alt="Uploaded product"
                    className="h-40 w-40 rounded-2xl object-cover"
                  />

                  <input
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="Image URL"
                    className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm outline-none focus:border-vjj-gold"
                  />
                </div>
              )}
            </div>

            <input
              name="sizes"
              value={form.sizes}
              onChange={handleChange}
              placeholder="Sizes comma separated e.g. 12,14,16"
              className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
            />

            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="Tags comma separated e.g. gold,wedding,premium"
              className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
            />

            <div className="grid gap-3 rounded-2xl bg-vjj-ivory p-4">
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                />
                Featured / Signature Product
              </label>

              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  name="isReadyToShip"
                  checked={form.isReadyToShip}
                  onChange={handleChange}
                />
                Ready To Ship
              </label>
            </div>

            <button
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-4 text-sm font-bold text-white transition hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              {creating ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>

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
                const image =
                  product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=90";

                return (
                  <div
                    key={product._id}
                    className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-vjj-ivory p-4 md:flex-row md:items-center"
                  >
                    <img
                      src={`${image}?auto=format&fit=crop&w=220&q=90`}
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
          <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-6 shadow-2xl">
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

            <form onSubmit={handleUpdateProduct} className="grid gap-4">
              <input
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                placeholder="Product name"
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                required
              />

              <input
                name="sku"
                value={editForm.sku}
                onChange={handleEditChange}
                placeholder="SKU"
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                required
              />

              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                placeholder="Product description"
                rows="4"
                className="resize-none rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                required
              />

              <div className="grid gap-4 md:grid-cols-2">
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  name="material"
                  value={editForm.material}
                  onChange={handleEditChange}
                  className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                >
                  <option value="Gold">Gold</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Rose Gold">Rose Gold</option>
                  <option value="Gemstone">Gemstone</option>
                </select>

                <select
                  name="purity"
                  value={editForm.purity}
                  onChange={handleEditChange}
                  className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                >
                  <option value="9KT">9KT</option>
                  <option value="14KT">14KT</option>
                  <option value="18KT">18KT</option>
                  <option value="22KT">22KT</option>
                  <option value="24KT">24KT</option>
                  <option value="925 Silver">925 Silver</option>
                </select>

                <input
                  name="stock"
                  value={editForm.stock}
                  onChange={handleEditChange}
                  placeholder="Stock"
                  type="number"
                  className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <input
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  placeholder="Price"
                  type="number"
                  className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                  required
                />

                <input
                  name="compareAtPrice"
                  value={editForm.compareAtPrice}
                  onChange={handleEditChange}
                  placeholder="MRP"
                  type="number"
                  className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                />

                <input
                  name="makingCharges"
                  value={editForm.makingCharges}
                  onChange={handleEditChange}
                  placeholder="Making"
                  type="number"
                  className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
                />
              </div>

              <div className="rounded-2xl border border-black/10 bg-vjj-ivory p-4">
                <label className="mb-3 block text-sm font-bold text-vjj-black">
                  Product Image
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleEditImageUpload}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm"
                />

                {uploadingEditImage && (
                  <p className="mt-3 text-sm font-semibold text-vjj-bronze">
                    Uploading image...
                  </p>
                )}

                {editForm.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={editForm.imageUrl}
                      alt="Uploaded product"
                      className="h-40 w-40 rounded-2xl object-cover"
                    />

                    <input
                      name="imageUrl"
                      value={editForm.imageUrl}
                      onChange={handleEditChange}
                      placeholder="Image URL"
                      className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm outline-none focus:border-vjj-gold"
                    />
                  </div>
                )}
              </div>

              <input
                name="sizes"
                value={editForm.sizes}
                onChange={handleEditChange}
                placeholder="Sizes comma separated e.g. 12,14,16"
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              />

              <input
                name="tags"
                value={editForm.tags}
                onChange={handleEditChange}
                placeholder="Tags comma separated e.g. gold,wedding,premium"
                className="rounded-2xl border border-black/10 px-5 py-3 outline-none focus:border-vjj-gold"
              />

              <div className="grid gap-3 rounded-2xl bg-vjj-ivory p-4">
                <label className="flex items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={editForm.isFeatured}
                    onChange={handleEditChange}
                  />
                  Featured / Signature Product
                </label>

                <label className="flex items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    name="isReadyToShip"
                    checked={editForm.isReadyToShip}
                    onChange={handleEditChange}
                  />
                  Ready To Ship
                </label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  disabled={updating}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-4 text-sm font-bold text-white transition hover:bg-vjj-bronze disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Pencil size={18} />
                  {updating ? "Updating..." : "Update Product"}
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 py-4 text-sm font-bold text-vjj-black transition hover:bg-vjj-ivory"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
