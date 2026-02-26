import User from "../models/User.model.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({
      role: "teacher",
      college: req.userCollege,
    })
      .populate({
        path: "department",
        model: "Department",
        select: "name code",
      })
      .sort({ username: 1 });

    res.status(200).json(teachers);
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req, res, next) => {
  try {
    const {
      name,
      email,
      teacherId,
      department,
      contactNumber,
      sendEmail: shouldSendEmail,
    } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }


    if (teacherId) {
      const existingId = await User.findOne({ teacherId: teacherId.trim() });
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: "A teacher with this Faculty ID already exists",
        });
      }
    }


    const tempPassword = crypto.randomBytes(4).toString("hex");

    const photo = req.file
      ? `/uploads/teachers/${req.file.filename}`
      : undefined;

    const teacher = await User.create({
      username: name,
      email,
      password: tempPassword,
      role: "teacher",
      college: req.userCollege,
      teacherId,
      department,
      contactNumber,
      photo,
    });


    if (shouldSendEmail !== false) {
      try {
        await sendEmail({
          email: teacher.email,
          subject: "Welcome to ExamSeatPro - Your Teacher Account Details",
          message: `Hello ${name},\n\nYour teacher account has been created on ExamSeatPro.\n\nUsername: ${email}\nPassword: ${tempPassword}\n\nPlease login and change your password immediately.\n\nBest regards,\nExamSeatPro Team`,
          html: `
            <h1>Welcome to ExamSeatPro</h1>
            <p>Hello ${name},</p>
            <p>Your teacher account has been created successfully.</p>
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
    }

    res.status(201).json(teacher);
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req, res, next) => {
  try {
    const { name, email, teacherId, department, contactNumber } = req.body;

    let teacher = await User.findOne({
      _id: req.params.id,
      role: "teacher",
      college: req.userCollege,
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }


    if (email && email !== teacher.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingEmail = await User.findOne({ email: normalizedEmail });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "A user with this email already exists",
        });
      }
      teacher.email = normalizedEmail;
    }


    if (teacherId && teacherId !== teacher.teacherId) {
      const existingId = await User.findOne({ teacherId: teacherId.trim() });
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: "A teacher with this Faculty ID already exists",
        });
      }
      teacher.teacherId = teacherId.trim();
    }


    if (name) teacher.username = name;
    if (department) teacher.department = department;
    if (contactNumber) teacher.contactNumber = contactNumber;

    if (req.file) {
      teacher.photo = `/uploads/teachers/${req.file.filename}`;
    }

    await teacher.save();

    res.status(200).json(teacher);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A user with this ${field} already exists`,
      });
    }
    next(error);
  }
};

export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findOneAndDelete({
      _id: req.params.id,
      role: "teacher",
      college: req.userCollege,
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    next(error);
  }
};
