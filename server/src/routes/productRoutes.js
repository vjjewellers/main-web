const express = require("express");

const {
  getProducts,
  getProductsAdmin,
  getProductBySlug,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

/* Public catalogue */
router.get("/", getProducts);

/* Admin-only product records, including hidden/inactive products */
router.get("/admin/all", protect, adminOnly, getProductsAdmin);

router.post("/admin", protect, adminOnly, createProductAdmin);

router.patch("/admin/:id", protect, adminOnly, updateProductAdmin);

router.delete("/admin/:id", protect, adminOnly, deleteProductAdmin);

/* Keep this last because slug can match many values */
router.get("/:slug", getProductBySlug);

module.exports = router;
