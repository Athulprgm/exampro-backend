import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student", "superadmin"],
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    // Student specific fields
    registerNumber: {
      type: String,
      sparse: true,
    },
    admissionNo: {
      type: String,
      sparse: true,
    },
    department: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },
    subject: {
      type: String,
      required: function () {
        return this.role === "student";
      },
      trim: true,
    },
    semester: {
      type: Number,
      required: function () {
        return this.role === "student";
      },
      min: 1,
      max: 8,
    },
    photo: {
      type: String, // URL to photo
      default: "",
    },
    contactNumber: {
      type: String,
    },
    // Teacher specific fields
    teacherId: {
      type: String,
      sparse: true,
    },
    // Admin specific fields
    adminRole: {
      type: String,
      enum: ["principal", "hod", "clerk", "admin"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;
