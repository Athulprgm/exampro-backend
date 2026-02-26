import mongoose from "mongoose";
import User from "../models/User.model.js";
import College from "../models/College.model.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/examseatpro",
    );
    console.log("Connected to MongoDB...");

    const email = "superadmin@examseatpro.com";
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Superadmin already exists.");
      process.exit(0);
    }

    // Create a system college for superadmin if needed
    let systemCollege = await College.findOne({
      collegeName: "System Central",
    });
    if (!systemCollege) {
      systemCollege = await College.create({
        collegeName: "System Central",
        type: "institute",
        address: "Cloud Network",
        adminEmail: email,
        adminContact: "0000000000",
        adminName: "Master Admin",
      });
    }

    const superAdmin = await User.create({
      username: "masteradmin",
      email: email,
      password: "adminpassword123", // They should change this
      role: "superadmin",
      college: systemCollege._id,
      isActive: true,
    });

    console.log("Superadmin created successfully!");
    console.log("Email: " + email);
    console.log("Password: adminpassword123");

    process.exit(0);
  } catch (error) {
    console.error("Error creating superadmin:", error);
    process.exit(1);
  }
};

createSuperAdmin();
