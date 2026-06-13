const Product = require("../models/Product");

const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      material,
      purity,
      featured,
      readyToShip,
      isFeatured,
      isReadyToShip,
      minPrice,
      maxPrice,
      search,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      isActive: true,
    };

    if (category) {
      query.category = category;
    }

    if (material) {
      query.material = material;
    }

    if (purity) {
      query.purity = purity;
    }

    if (featured === "true" || isFeatured === "true") {
      query.isFeatured = true;
    }

    if (readyToShip === "true" || isReadyToShip === "true") {
      query.isReadyToShip = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    if (sort === "price-low") {
      sortOption = { price: 1 };
    }

    if (sort === "price-high") {
      sortOption = { price: -1 };
    }

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(perPage);

    const total = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      currentPage,
      totalPages: Math.ceil(total / perPage),
      products,
    });
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

const createProductAdmin = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      material,
      purity,
      price,
      compareAtPrice,
      makingCharges,
      taxRate,
      stock,
      sizes,
      images,
      tags,
      isFeatured,
      isReadyToShip,
    } = req.body || {};

    if (
      !name ||
      !sku ||
      !description ||
      !category ||
      !material ||
      !purity ||
      !price
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, SKU, description, category, material, purity and price are required.",
      });
    }

    const existingProduct = await Product.findOne({ sku });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists with this SKU.",
      });
    }

    const product = await Product.create({
      name,
      sku,
      description,
      category,
      material,
      purity,
      price: Number(price),
      compareAtPrice: Number(compareAtPrice || 0),
      makingCharges: Number(makingCharges || 0),
      taxRate: Number(taxRate || 3),
      stock: Number(stock || 0),
      sizes: Array.isArray(sizes) ? sizes : [],
      images: Array.isArray(images) ? images : [],
      tags: Array.isArray(tags) ? tags : [],
      isFeatured: Boolean(isFeatured),
      isReadyToShip: Boolean(isReadyToShip),
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProductAdmin = async (req, res, next) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      material,
      purity,
      price,
      compareAtPrice,
      makingCharges,
      taxRate,
      stock,
      sizes,
      images,
      tags,
      isFeatured,
      isReadyToShip,
      isActive,
    } = req.body || {};

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Another product already exists with this SKU.",
        });
      }
    }

    if (name !== undefined) product.name = name;
    if (sku !== undefined) product.sku = sku;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (material !== undefined) product.material = material;
    if (purity !== undefined) product.purity = purity;
    if (price !== undefined) product.price = Number(price);
    if (compareAtPrice !== undefined) {
      product.compareAtPrice = Number(compareAtPrice || 0);
    }
    if (makingCharges !== undefined) {
      product.makingCharges = Number(makingCharges || 0);
    }
    if (taxRate !== undefined) product.taxRate = Number(taxRate || 3);
    if (stock !== undefined) product.stock = Number(stock || 0);

    if (sizes !== undefined) {
      product.sizes = Array.isArray(sizes) ? sizes : [];
    }

    if (images !== undefined) {
      product.images = Array.isArray(images) ? images : [];
    }

    if (tags !== undefined) {
      product.tags = Array.isArray(tags) ? tags : [];
    }

    if (isFeatured !== undefined) {
      product.isFeatured = Boolean(isFeatured);
    }

    if (isReadyToShip !== undefined) {
      product.isReadyToShip = Boolean(isReadyToShip);
    }

    if (isActive !== undefined) {
      product.isActive = Boolean(isActive);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProductAdmin = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    product.isActive = false;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
};
