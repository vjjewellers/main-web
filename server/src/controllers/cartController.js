const User = require("../models/User");
const Product = require("../models/Product");

const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "cart.product",
      select: "name slug price stock images material purity",
    });

    return res.status(200).json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    console.log("CART CONTENT-TYPE:", req.headers["content-type"]);
    console.log("CART REQ BODY:", req.body);

    let body = req.body || {};

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const {
      productId,
      quantity = 1,
      selectedSize = "",
      selectedMaterial = "",
    } = body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
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

    const requestedQuantity = Number(quantity);

    if (!requestedQuantity || requestedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    if (product.stock < requestedQuantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is not available in stock.",
      });
    }

    const user = await User.findById(req.user._id);

    const existingItem = user.cart.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedMaterial === selectedMaterial,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + requestedQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Cart quantity exceeds available stock.",
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      user.cart.push({
        product: productId,
        quantity: requestedQuantity,
        selectedSize,
        selectedMaterial,
      });
    }

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate({
      path: "cart.product",
      select: "name slug price stock images material purity",
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart.",
      cart: updatedUser.cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    let body = req.body || {};

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const {
      productId,
      quantity,
      selectedSize = "",
      selectedMaterial = "",
    } = body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required.",
      });
    }

    const requestedQuantity = Number(quantity);

    if (!requestedQuantity || requestedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (requestedQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock.",
      });
    }

    const user = await User.findById(req.user._id);

    const item = user.cart.find(
      (cartItem) =>
        cartItem.product.toString() === productId &&
        cartItem.selectedSize === selectedSize &&
        cartItem.selectedMaterial === selectedMaterial,
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    item.quantity = requestedQuantity;

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate({
      path: "cart.product",
      select: "name slug price stock images material purity",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated.",
      cart: updatedUser.cart,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId,
    );

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate({
      path: "cart.product",
      select: "name slug price stock images material purity",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart.",
      cart: updatedUser.cart,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = [];

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared.",
      cart: [],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
