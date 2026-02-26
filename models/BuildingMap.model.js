import mongoose from "mongoose";

const buildingMapSchema = new mongoose.Schema(
  {
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    floor: {
      type: Number,
      default: 0, // 0 for Ground, 1 for First, etc.
    },
    nodes: [
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ["room", "entrance", "stair", "node"],
          default: "node",
        },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        label: String,
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
      },
    ],
    edges: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
      },
    ],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for unique map per floor per college
buildingMapSchema.index({ college: 1, floor: 1 }, { unique: true });

const BuildingMap = mongoose.model("BuildingMap", buildingMapSchema);

export default BuildingMap;
