import Malpractice from "../models/Malpractice.model.js";
import User from "../models/User.model.js";

export const getAllMalpractices = async (req, res, next) => {
  try {
    const malpractices = await Malpractice.find({ college: req.userCollege })
      .populate("student", "username registerNumber email")
      .populate("exam", "name subject date")
      .populate("reportedBy", "username role")
      .sort({ createdAt: -1 });

    res.status(200).json(malpractices);
  } catch (error) {
    next(error);
  }
};

export const searchStudent = async (req, res, next) => {
  try {
    const { identifier } = req.query;

    const student = await User.findOne({
      college: req.userCollege,
      role: "student",
      $or: [{ registerNumber: identifier }, { admissionNo: identifier }],
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

export const reportMalpractice = async (req, res, next) => {
  try {
    const { studentId, examId, description, images } = req.body;

    const malpractice = await Malpractice.create({
      student: studentId,
      exam: examId,
      description,
      images: images || [],
      reportedBy: req.user._id,
      college: req.userCollege,
    });

    res.status(201).json(malpractice);
  } catch (error) {
    next(error);
  }
};

export const updateMalpractice = async (req, res, next) => {
  try {
    const malpractice = await Malpractice.findOneAndUpdate(
      { _id: req.params.id, college: req.userCollege },
      {
        ...req.body,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!malpractice) {
      return res.status(404).json({ message: "Malpractice not found" });
    }

    res.status(200).json(malpractice);
  } catch (error) {
    next(error);
  }
};

export const deleteMalpractice = async (req, res, next) => {
  try {
    const malpractice = await Malpractice.findOneAndDelete({
      _id: req.params.id,
      college: req.userCollege,
    });

    if (!malpractice) {
      return res.status(404).json({ message: "Malpractice not found" });
    }

    res.status(200).json({ message: "Malpractice deleted successfully" });
  } catch (error) {
    next(error);
  }
};
