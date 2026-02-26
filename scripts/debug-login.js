import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.model.js";

dotenv.config();

const debugLogin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/examseatpro",
    );
    console.log("Connected to MongoDB");

    const username = "admin";
    const password = "password123";

    console.log(`Attempting to find user: ${username}`);

    // logic from auth.controller.js
    const user = await User.findOne({
      $or: [
        { username },
        { email: username },
        { registerNumber: username },
        { teacherId: username },
      ],
    }).select("+password");

    if (!user) {
      console.log("❌ User not found!");
      return;
    }

    console.log("✅ User found:", user.username);
    console.log("Stored Password Hash:", user.password);

    console.log(`Checking password: ${password}`);
    const isMatch = await user.comparePassword(password);

    if (isMatch) {
      console.log("✅ Password match SUCCESS!");
    } else {
      console.log("❌ Password match FAILED.");
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.connection.close();
  }
};

debugLogin();
