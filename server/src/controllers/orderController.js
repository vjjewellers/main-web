const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const calculateShipping = require("../utils/calculateShipping");
const generateOrderNumber = require("../utils/generateOrderNumber");

const checkout = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      paymentProvider = "mock",
      notes = "",
      saveAddress = true,
    } = req.body || {};

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required.",
      });
    }

    const requiredAddressFields = [
      "fullName",
      "phone",
      "line1",
      "city",
      "state",
      "pincode",
    ];

    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required in shipping address.`,
        });
      }
    }

    const user = await User.findById(req.user._id).populate("cart.product");

    if (!user || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty.",
      });
    }

    const orderItems = [];

    let subtotal = 0;
    let taxAmount = 0;

    for (const cartItem of user.cart) {
      const product = await Product.findById(cartItem.product._id);

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `${cartItem.product.name} is no longer available.`,
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has only ${product.stock} item(s) available.`,
        });
      }

      const primaryImage =
        product.images.find((image) => image.isPrimary)?.url ||
        product.images[0]?.url ||
        "";

      const lineTotal = product.price * cartItem.quantity;
      const lineTax = Math.round(lineTotal * ((product.taxRate || 3) / 100));

      subtotal += lineTotal;
      taxAmount += lineTax;

      orderItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        image: primaryImage,
        price: product.price,
        quantity: cartItem.quantity,
        selectedSize: cartItem.selectedSize,
        selectedMaterial: cartItem.selectedMaterial,
      });

      product.stock -= cartItem.quantity;
      await product.save();
    }

    const shippingCost = calculateShipping(subtotal, shippingAddress.pincode);
    const totalAmount = subtotal + taxAmount + shippingCost;

    const paymentStatus =
      paymentProvider === "cod" || paymentProvider === "upi_manual"
        ? "pending"
        : "paid";

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      taxAmount,
      totalAmount,
      payment: {
        provider: paymentProvider,
        status: paymentStatus,
        transactionId: paymentProvider === "mock" ? `MOCK-${Date.now()}` : "",
        paidAt: paymentStatus === "paid" ? new Date() : undefined,
      },
      orderStatus: "placed",
      notes,
    });

    if (saveAddress) {
      const alreadyExists = user.addresses.some(
        (address) =>
          address.line1 === shippingAddress.line1 &&
          address.pincode === shippingAddress.pincode &&
          address.phone === shippingAddress.phone,
      );

      if (!alreadyExists) {
        user.addresses.push({
          ...shippingAddress,
          isDefault: user.addresses.length === 0,
        });
      }
    }

    user.cart = [];
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
};
