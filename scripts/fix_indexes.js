import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/examseatpro",
    );
    const db = mongoose.connection.db;

    console.log("Connected to database...");

    try {
      const indexes = await db.collection("departments").indexes();
      console.log(
        "Current indexes on departments:",
        indexes.map((i) => i.name),
      );

      const oldIndex = indexes.find((i) => i.name === "name_1_college_1");
      if (oldIndex) {
        await db.collection("departments").dropIndex("name_1_college_1");
        console.log(
          "✅ Successfully dropped conflicting index: departments.name_1_college_1",
        );
      } else {
        console.log("ℹ️ Index departments.name_1_college_1 not found.");
      }

      const roomIndexes = await db.collection("rooms").indexes();
      console.log(
        "Current indexes on rooms:",
        roomIndexes.map((i) => i.name),
      );
      const oldRoomIndex = roomIndexes.find(
        (i) => i.name === "name_1_college_1",
      );

      if (oldRoomIndex) {
        await db.collection("rooms").dropIndex("name_1_college_1");
        console.log(
          "✅ Successfully dropped conflicting index: rooms.name_1_college_1",
        );
      } else {
        console.log("ℹ️ Index rooms.name_1_college_1 not found.");
      }
    } catch (err) {
      console.error("Error managing indexes:", err.message);
    }

    console.log("Index cleanup complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ DB Connection Error:", error);
    process.exit(1);
  }
};

run();
