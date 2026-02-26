import mongoose from "mongoose";
import User from "../models/User.model.js";
import College from "../models/College.model.js";
import dotenv from "dotenv";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Super Admin needs a fake college or no college?
    // User model requires college. Let's create a 'System' college.
    let systemCollege = await College.findOne({
      collegeName: "System Central",
    });
    if (!systemCollege) {
      systemCollege = await College.create({
        collegeName: "System Central",
        address: "Cloud",
        adminEmail: "superadmin@examseatpro.com",
        adminContact: "0000000000",
        adminName: "System Admin",
        type: "university",
      });
      console.log("System College created");
    }

    const email = "superadmin@examseatpro.com";
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Super Admin already exists");
      process.exit(0);
    }

    const superAdmin = await User.create({
      username: "SuperAdmin",
      email: email,
      password: "adminp@ssword123", // Default password
      role: "superadmin",
      college: systemCollege._id,
      isActive: true,
    });

    console.log("Super Admin created successfully");
    console.log("Email: superadmin@examseatpro.com");
    console.log("Password: adminp@ssword123");
    process.exit(0);
  } catch (error) {
    console.error("Error creating Super Admin:", error);
    process.exit(1);
  }
};

createSuperAdmin();
