const express = require("express");
const {
  getAdminRateSettings,
  getAdminLiveRateReference,
  saveAdminRateSettings,
  disableAdminManualRate,
} = require("../controllers/rateController");

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
router.get("/market-rates", getAdminRateSettings);
router.get("/market-rates/live-reference", getAdminLiveRateReference);
router.put("/market-rates/:state", saveAdminRateSettings);
router.patch("/market-rates/:state/disable", disableAdminManualRate);

module.exports = router;
