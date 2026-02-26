import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    collegeName: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
    },
    collegeCode: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: ["school", "college", "university", "institute"],
      default: "college",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    adminContact: {
      type: String,
      required: true,
    },
    adminName: {
      type: String,
      required: true,
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

// Generate unique college code before saving
collegeSchema.pre("save", async function (next) {
  if (!this.collegeCode) {
    const prefix = this.collegeName.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.collegeCode = `${prefix}${random}`;
  }
  next();
});

const College = mongoose.model("College", collegeSchema);

export default College;
