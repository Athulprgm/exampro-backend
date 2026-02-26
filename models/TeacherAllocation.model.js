import mongoose from "mongoose";

const teacherAllocationSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "completed", "cancelled"],
      default: "assigned",
    },
  },
  {
    timestamps: true,
  },
);

// Prevent double booking of a teacher for the same exam
teacherAllocationSchema.index({ exam: 1, teacher: 1 }, { unique: true });
// Prevent double booking of a room for the same exam? Maybe, or maybe multiple teachers per room?
// Let's assume one teacher per room for now unless specified otherwise, but usually multiple teachers can invigilate big halls.
// However, a teacher cannot be in two places.

const TeacherAllocation = mongoose.model(
  "TeacherAllocation",
  teacherAllocationSchema,
);

export default TeacherAllocation;
