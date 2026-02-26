import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.model.js";
import College from "../models/College.model.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/examseatpro";
    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB at ${mongoUri}`);

    // 1. Create College
    let college = await College.findOne({ adminEmail: "admin@demo.com" });
    if (!college) {
      console.log("Creating demo college...");
      college = await College.create({
        collegeName: "Demo Engineering College",
        collegeCode: "DEMO01",
        type: "college",
        address: "123 Education Lane, Tech City",
        adminEmail: "admin@demo.com",
        adminContact: "9876543210",
        adminName: "System Administrator",
      });
      console.log("✅ College created:", college.collegeName);
    } else {
      console.log("ℹ️ College already exists:", college.collegeName);
    }

    // 2. Create Admin User
    let admin = await User.findOne({ email: "admin@demo.com" });
    if (!admin) {
      console.log("Creating admin user...");
      admin = await User.create({
        username: "admin",
        email: "admin@demo.com",
        password: "password123", // Will be hashed by pre-save hook
        role: "admin",
        adminRole: "admin",
        college: college._id,
      });
      console.log("✅ Admin user created");
      console.log("-----------------------------------------");
      console.log("👉 Username: admin");
      console.log("👉 Password: password123");
      console.log("-----------------------------------------");
    } else {
      console.log("ℹ️ Admin user already exists");
    }

    // 3. Create Teacher User (Optional, for testing)
    let teacher = await User.findOne({ email: "teacher@demo.com" });
    if (!teacher) {
      console.log("Creating teacher user...");
      teacher = await User.create({
        username: "teacher",
        email: "teacher@demo.com",
        password: "password123",
        role: "teacher",
        teacherId: "TCH001",
        college: college._id,
        department: "Computer Science",
      });
      console.log("✅ Teacher user created (teacher / password123)");
    }

    // 4. Create Student User (Optional, for testing)
    let student = await User.findOne({ email: "student@demo.com" });
    if (!student) {
      console.log("Creating student user...");
      student = await User.create({
        username: "student",
        email: "student@demo.com",
        password: "password123",
        role: "student",
        registerNumber: "REG001",
        college: college._id,
        department: "Computer Science",
        semester: 4,
      });
      console.log("✅ Student user created (student / password123)");
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDatabase();
