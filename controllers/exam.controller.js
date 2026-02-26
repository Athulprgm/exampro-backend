import Exam from "../models/Exam.model.js";

export const getAllExams = async (req, res, next) => {
  try {
    const query = { college: req.userCollege };


    if (req.user.role === "student") {
      query.department = req.user.department;
      query.subject = req.user.subject;
      query.semester = req.user.semester;
    }

    const exams = await Exam.find(query).sort({
      date: 1,
    });
    res.status(200).json(exams);
  } catch (error) {
    next(error);
  }
};

export const getExam = async (req, res, next) => {
  try {
    const query = {
      _id: req.params.id,
      college: req.userCollege,
    };


    if (req.user.role === "student") {
      query.department = req.user.department;
      query.subject = req.user.subject;
      query.semester = req.user.semester;
    }

    const exam = await Exam.findOne(query);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(exam);
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const {
      name,
      subject,
      paperName,
      paperCode,
      department,
      date,
      time,
      semester,
      duration,
      instructions,
    } = req.body;

    const exam = await Exam.create({
      name,
      subject,
      paperName,
      paperCode,
      department,
      date,
      time,
      semester,
      duration,
      instructions,
      college: req.userCollege,
    });
    res.status(201).json(exam);
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOneAndUpdate(
      { _id: req.params.id, college: req.userCollege },
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(exam);
  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findOneAndDelete({
      _id: req.params.id,
      college: req.userCollege,
    });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    next(error);
  }
};
