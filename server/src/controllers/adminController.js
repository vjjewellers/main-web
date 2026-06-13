const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      {
        $match: {
          "payment.status": "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const pendingOrders = await Order.countDocuments({
      orderStatus: {
        $in: ["placed", "confirmed", "processing", "packed"],
      },
    });

    const lowStockProducts = await Product.find({
      isActive: true,
      stock: { $lte: 5 },
    }).select("name sku stock price category");

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.orderStatus = status;
    }

    if (paymentStatus) {
      query["payment.status"] = paymentStatus;
    }

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    const total = await Order.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      currentPage,
      totalPages: Math.ceil(total / perPage),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleOrderAdmin = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone addresses",
    );

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

const updateOrderStatus = async (req, res, next) => {
  try {
    const {
      orderStatus,
      paymentStatus,
      courierName,
      trackingNumber,
      estimatedDelivery,
    } = req.body || {};

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (orderStatus) {
      const allowedStatuses = [
        "placed",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status.",
        });
      }

      order.orderStatus = orderStatus;

      if (!order.shipping) {
        order.shipping = {};
      }

      if (orderStatus === "shipped") {
        order.shipping.shippedAt = new Date();
      }

      if (orderStatus === "delivered") {
        order.shipping.deliveredAt = new Date();
      }
    }

    if (paymentStatus) {
      const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];

      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status.",
        });
      }

      if (!order.payment) {
        order.payment = {};
      }

      order.payment.status = paymentStatus;

      if (paymentStatus === "paid" && !order.payment.paidAt) {
        order.payment.paidAt = new Date();
      }
    }

    if (!order.shipping) {
      order.shipping = {};
    }

    if (courierName !== undefined) {
      order.shipping.courierName = courierName;
    }

    if (trackingNumber !== undefined) {
      order.shipping.trackingNumber = trackingNumber;
    }

    if (estimatedDelivery) {
      order.shipping.estimatedDelivery = estimatedDelivery;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully.",
      order,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body || {};

    const schemaRoles = User.schema.path("role")?.enumValues || [];
    const allowedRoles =
      schemaRoles.length > 0 ? schemaRoles : ["user", "admin", "super_admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid user role. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body || {};

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User status updated successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllOrders,
  getSingleOrderAdmin,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
};
