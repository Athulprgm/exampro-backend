import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    paperName: {
      type: String,
      trim: true,
    },
    paperCode: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    time: {
      type: String,
      required: [true, "Exam time is required"],
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
    duration: {
      type: Number,
      required: true,
      min: 30, // minutes
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    totalSeats: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    instructions: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
