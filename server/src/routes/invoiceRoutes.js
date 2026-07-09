const express = require("express");

const {
  getInvoicesAdmin,
  getInvoiceByIdAdmin,
  previewInvoiceAdmin,
  createInvoiceAdmin,
  cancelInvoiceAdmin,
} = require("../controllers/invoiceController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", getInvoicesAdmin);
router.post("/preview", previewInvoiceAdmin);
router.post("/", createInvoiceAdmin);
router.get("/:id", getInvoiceByIdAdmin);
router.patch("/:id/cancel", cancelInvoiceAdmin);

module.exports = router;
