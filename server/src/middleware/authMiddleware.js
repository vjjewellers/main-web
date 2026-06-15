const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token = "";

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id || decoded.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid. Please login again.",
    });
  }
};

const adminOnly = (req, res, next) => {
  const role = String(req.user?.role || "").toLowerCase();

  const allowedRoles = ["admin", "super_admin", "superadmin"];

  if (!allowedRoles.includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin permission required.",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};
