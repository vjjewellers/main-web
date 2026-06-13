const express = require("express");

const {
  getProducts,
  getProductBySlug,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProducts);

router.post("/admin", protect, adminOnly, createProductAdmin);
router.patch("/admin/:id", protect, adminOnly, updateProductAdmin);
router.delete("/admin/:id", protect, adminOnly, deleteProductAdmin);

router.get("/:slug", getProductBySlug);

module.exports = router;
