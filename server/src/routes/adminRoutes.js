const express = require("express");

const {
  getAdminStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/stats", getAdminStats);
router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/users", getAllUsers);

module.exports = router;
