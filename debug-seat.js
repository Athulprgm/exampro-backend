import mongoose from "mongoose";
import SeatArrangement from "./models/SeatArrangement.model.js";
import User from "./models/User.model.js";
import Exam from "./models/Exam.model.js";

const run = async () => {
  try {
    // Hardcoded connection string from .env
    const uri = "mongodb://localhost:27017/examseatpro";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB at " + uri);

    const examId = "698ee9d38d43e82011cdc507"; // from error log
    console.log(`Checking Exam ID: ${examId}`);

    // Check if exam exists.
    // If ID is not valid ObjectId, findById throws error, so we catch it.
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      console.log("Invalid Exam ID format.");
      return;
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      console.log(`Exam NOT FOUND.`);
    } else {
      console.log(`Exam Found: ${exam.name} (${exam._id})`);
      console.log(`Dept: ${exam.department}, Subject: ${exam.subject}`);
    }

    const arrangement = await SeatArrangement.findOne({ exam: examId });

    if (!arrangement) {
      console.log(`No Seat Arrangement found for this exam.`);
    } else {
      console.log(`Seat Arrangement FOUND.`);
      console.log(`Total Halls: ${arrangement.halls.length}`);

      let totalSeats = 0;
      let students = [];
      arrangement.halls.forEach((h) => {
        h.seats.forEach((s) => {
          if (s.student) {
            students.push(s.student.toString());
            totalSeats++;
          }
        });
      });
      console.log(`Total Allocated Seats: ${totalSeats}`);
      if (students.length > 0) {
        console.log(`First 3 Student IDs: ${students.slice(0, 3).join(", ")}`);
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Disconnected");
    }
  }
};

run();
