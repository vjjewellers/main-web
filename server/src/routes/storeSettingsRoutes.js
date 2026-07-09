const express = require("express");

const {
  getStoreSettingsAdmin,
  updateStoreSettingsAdmin,
} = require("../controllers/storeSettingsController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", getStoreSettingsAdmin);
router.put("/", updateStoreSettingsAdmin);

module.exports = router;
