import User from "../models/User.model.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({
      role: "student",
      college: req.userCollege,
    }).sort({ username: 1 });

    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      regNo,
      admissionNo,
      department,
      subject,
      semester,
      contactNumber,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Generate random password
    const tempPassword = crypto.randomBytes(4).toString("hex");

    const photo = req.file
      ? `/uploads/students/${req.file.filename}`
      : undefined;

    const student = await User.create({
      username: name,
      email,
      password: tempPassword,
      role: "student",
      college: req.userCollege,
      registerNumber: regNo,
      admissionNo,
      department,
      subject,
      semester,
      contactNumber,
      photo,
    });

    // Send email with password
    try {
      await sendEmail({
        email: student.email,
        subject: "Welcome to ExamSeatPro - Your Account Details",
        message: `Hello ${name},\n\nYour account has been created on ExamSeatPro.\n\nUsername: ${email}\nPassword: ${tempPassword}\n\nPlease login and change your password immediately.\n\nBest regards,\nExamSeatPro Team`,
        html: `
          <h1>Welcome to ExamSeatPro</h1>
          <p>Hello ${name},</p>
          <p>Your account has been created successfully.</p>
          <p><strong>Username:</strong> ${email}</p>
          <p><strong>Password:</strong> ${tempPassword}</p>
          <p>Please login and change your password immediately.</p>
          <br>
          <p>Best regards,<br>ExamSeatPro Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.photo = `/uploads/students/${req.file.filename}`;
    }

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: "student", college: req.userCollege },
      updateData,
      { new: true, runValidators: true },
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: "student",
      college: req.userCollege,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    next(error);
  }
};
