const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePassword);

module.exports = router;
