require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@vjjshop.com";
    const newPassword = "Admin@1234";

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
      console.log("Admin user not found.");
      process.exit(1);
    }

    console.log("Admin password reset successfully.");
    console.log("Email:", email);
    console.log("New Password:", newPassword);

    process.exit(0);
  } catch (error) {
    console.error("Reset failed:", error);
    process.exit(1);
  }
};

resetAdminPassword();
