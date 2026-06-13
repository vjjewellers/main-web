const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");

const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id)
      .select("wishlist")
      .populate({
        path: "wishlist",
        match: { isActive: true },
        select:
          "name slug sku description category material purity price compareAtPrice stock images isFeatured isReadyToShip",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const wishlist = user.wishlist.filter(Boolean);

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

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

    const user = await User.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const alreadyExists = user.wishlist.some(
      (item) => item.toString() === productId,
    );

    if (!alreadyExists) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updatedUser = await User.findById(user._id)
      .select("wishlist")
      .populate({
        path: "wishlist",
        match: { isActive: true },
        select:
          "name slug sku description category material purity price compareAtPrice stock images isFeatured isReadyToShip",
      });

    return res.status(200).json({
      success: true,
      message: alreadyExists
        ? "Product already in wishlist."
        : "Product added to wishlist.",
      wishlist: updatedUser.wishlist.filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id.",
      });
    }

    const user = await User.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.wishlist = user.wishlist.filter(
      (item) => item.toString() !== productId,
    );

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select("wishlist")
      .populate({
        path: "wishlist",
        match: { isActive: true },
        select:
          "name slug sku description category material purity price compareAtPrice stock images isFeatured isReadyToShip",
      });

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist.",
      wishlist: updatedUser.wishlist.filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
