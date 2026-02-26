import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
    },
    building: {
      type: String,
      required: true,
    },
    floor: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    roomType: {
      type: String,
      enum: ["classroom", "lab", "hall", "auditorium"],
      default: "classroom",
    },
    // Map coordinates for navigation
    coordinates: {
      x: { type: Number },
      y: { type: Number },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index (Room name should be unique within a building in a college)
roomSchema.index({ name: 1, building: 1, college: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;
