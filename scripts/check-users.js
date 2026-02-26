import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.model.js";

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/examseatpro",
    );
    console.log("Connected to MongoDB");

    const users = await User.find({}, { password: 0 });
    console.log("Total users:", users.length);
    if (users.length > 0) {
      console.log("Users list:");
      users.forEach((u) => {
        console.log(
          `- Username: ${u.username}, Email: ${u.email}, Role: ${u.role}`,
        );
      });
    } else {
      console.log("No users found in the database.");
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error("Error:", err);
  }
};

checkUsers();
