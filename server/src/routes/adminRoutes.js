const express = require("express");

const {
  getAdminStats,
  getAllOrders,
  getSingleOrderAdmin,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Dashboard
router.get("/stats", getAdminStats);

// Orders
router.get("/orders", getAllOrders);
router.get("/orders/:id", getSingleOrderAdmin);
router.patch("/orders/:id/status", updateOrderStatus);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", updateUserStatus);

module.exports = router;
