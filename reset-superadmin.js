import mongoose from "mongoose";
import bcrypt from "bcryptjs";

async function resetSuperadminPassword() {
  try {
    await mongoose.connect("mongodb://localhost:27017/examseatpro");
    const db = mongoose.connection.db;

    const users = await db
      .collection("users")
      .find({ role: "superadmin" })
      .toArray();
    if (users.length === 0) {
      console.log("No superadmin found");
      process.exit(1);
    }

    const user = users[0];
    console.log("Found superadmin:", user.username);

    const salt = await bcrypt.genSalt(10);
    const password = "superadmin123";
    const hash = await bcrypt.hash(password, salt);

    await db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { password: hash } });

    console.log("Success! Superadmin password reset to: " + password);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetSuperadminPassword();
