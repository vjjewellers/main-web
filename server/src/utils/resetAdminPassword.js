require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");

const User = require("../models/User");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@vjjshop.com";
    const newPassword = "123456";

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const user = await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        role: "super_admin",
        isActive: true,
      },
      { new: true },
    );

    if (!user) {
      console.log("Admin user not found");
      process.exit(1);
    }

    console.log("Admin password reset successfully");
    console.log("Email:", email);
    console.log("Password:", newPassword);
    console.log("Role:", user.role);

    process.exit(0);
  } catch (error) {
    console.error("Password reset failed:", error.message);
    process.exit(1);
  }
};

resetAdminPassword();
