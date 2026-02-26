import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.model.js";

dotenv.config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}, "username email role");
    console.log("--- Database Users ---");
    users.forEach((u) =>
      console.log(
        `Username: ${u.username} | Email: ${u.email} | Role: ${u.role}`,
      ),
    );
    console.log("----------------------");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error listing users:", error);
  }
};

listUsers();
