const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);

/*
  Keep clear before /:productId
  Otherwise "clear" will be treated as productId.
*/
router.delete("/clear", clearCart);

/*
  Main frontend routes
*/
router.patch("/:productId", updateCartItem);
router.delete("/:productId", removeCartItem);

/*
  Backup routes, in case older frontend calls these
*/
router.patch("/update/:productId", updateCartItem);
router.delete("/remove/:productId", removeCartItem);

module.exports = router;
