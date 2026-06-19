import { supabase } from "../lib/supabase";

const mapProduct = (item) => {
  if (!item) return null;

  return {
    _id: item.id,
    id: item.id,

    name: item.name,
    slug: item.slug,
    sku: item.sku,

    category: item.category,
    material: item.material,
    purity: item.purity,

    price: Number(item.price || 0),
    comparePrice: Number(item.compare_price || 0),

    shortDescription: item.short_description,
    description: item.description,
    longDescription: item.long_description,

    images: item.images || [],

    isFeatured: item.is_featured,
    isActive: item.is_active,
    readyToShip: item.ready_to_ship,

    productCollection: item.product_collection,
    productType: item.product_type,
    occasion: item.occasion,
    gender: item.gender,
    materialColor: item.material_color,

    grossWeight: item.gross_weight,
    netWeight: item.net_weight,
    makingCharge: item.making_charge,
    gstPercent: item.gst_percent,

    highlights: item.highlights || [],
    specificationGroups: item.specification_groups || [],
    careInstructions: item.care_instructions,

    stock: item.stock,

    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

export const getProductsFromSupabase = async ({
  page = 1,
  limit = 24,
  search = "",
  category = "",
  material = "",
  purity = "",
  featured = false,
  sort = "newest",
} = {}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`,
    );
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (material) {
    query = query.eq("material", material);
  }

  if (purity) {
    query = query.eq("purity", purity);
  }

  if (featured) {
    query = query.eq("is_featured", true);
  }

  if (sort === "price-low") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price-high") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    products: (data || []).map(mapProduct),
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

export const getProductBySlugFromSupabase = async (slug) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) throw error;

  return mapProduct(data);
};

export const getRelatedProductsFromSupabase = async (category, currentId) => {
  if (!category) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", category)
    .neq("id", currentId)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) throw error;

  return (data || []).map(mapProduct);
};
