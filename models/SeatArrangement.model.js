import mongoose from "mongoose";

const seatArrangementSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    halls: [
      {
        room: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Room",
        },
        name: String,
        seats: [
          {
            seatId: String,
            row: Number,
            col: Number,
            student: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            examRef: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Exam",
            },
            isVerified: {
              type: Boolean,
              default: false,
            },
            verifiedBy: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            verifiedAt: Date,
          },
        ],
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
);


seatArrangementSchema.index({ exam: 1 }, { unique: true });

const SeatArrangement = mongoose.model(
  "SeatArrangement",
  seatArrangementSchema,
);

export default SeatArrangement;
