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


teacherAllocationSchema.index({ exam: 1, teacher: 1 }, { unique: true });




const TeacherAllocation = mongoose.model(
  "TeacherAllocation",
  teacherAllocationSchema,
);

export default TeacherAllocation;
