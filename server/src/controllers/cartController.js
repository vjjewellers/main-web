const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");

const populateCart = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "cart.product",
    select:
      "name slug sku description category material purity price compareAtPrice stock images isFeatured isReadyToShip isActive",
  });

  if (!user) return null;

  const activeItems = user.cart.filter(
    (item) => item.product && item.product.isActive !== false,
  );

  return activeItems;
};

const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const items = await populateCart(userId);

    if (!items) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      cart: {
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    console.log("CART CONTENT-TYPE:", req.headers["content-type"]);
    console.log("CART REQ BODY:", req.body);

    const userId = req.user._id || req.user.id;

    const {
      productId,
      quantity = 1,
      selectedSize = "",
      selectedMaterial = "",
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id.",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const safeQuantity = Math.max(1, Number(quantity || 1));

    const existingItem = user.cart.find((item) => {
      const sameProduct = item.product.toString() === productId;
      const sameSize = (item.selectedSize || "") === (selectedSize || "");
      const sameMaterial =
        (item.selectedMaterial || "") === (selectedMaterial || "");

      return sameProduct && sameSize && sameMaterial;
    });

    if (existingItem) {
      existingItem.quantity = Math.min(
        Number(existingItem.quantity || 1) + safeQuantity,
        product.stock || 999,
      );
    } else {
      user.cart.push({
        product: productId,
        quantity: Math.min(safeQuantity, product.stock || 999),
        selectedSize,
        selectedMaterial,
      });
    }

    await user.save();

    const items = await populateCart(userId);

    return res.status(200).json({
      success: true,
      message: "Product added to cart.",
      cart: {
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId } = req.params;

    const { quantity = 1, selectedSize = "", selectedMaterial = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const cartItem = user.cart.find((item) => {
      const sameProduct = item.product.toString() === productId;

      /*
        If frontend sends selectedSize/material, match exactly.
        If frontend does not send them, update first matching product.
      */
      const sameSize = selectedSize
        ? (item.selectedSize || "") === selectedSize
        : true;

      const sameMaterial = selectedMaterial
        ? (item.selectedMaterial || "") === selectedMaterial
        : true;

      return sameProduct && sameSize && sameMaterial;
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    const safeQuantity = Math.max(1, Number(quantity || 1));

    cartItem.quantity = Math.min(safeQuantity, product.stock || 999);

    await user.save();

    const items = await populateCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart item updated.",
      cart: {
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { productId } = req.params;

    const { selectedSize = "", selectedMaterial = "" } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.cart = user.cart.filter((item) => {
      const sameProduct = item.product.toString() === productId;

      const sameSize = selectedSize
        ? (item.selectedSize || "") === selectedSize
        : true;

      const sameMaterial = selectedMaterial
        ? (item.selectedMaterial || "") === selectedMaterial
        : true;

      return !(sameProduct && sameSize && sameMaterial);
    });

    await user.save();

    const items = await populateCart(userId);

    return res.status(200).json({
      success: true,
      message: "Cart item removed.",
      cart: {
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.cart = [];

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared.",
      cart: {
        items: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
