import Subject from "../models/Subject.model.js";

export const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ college: req.userCollege })
      .populate("department", "name code")
      .sort({ name: 1 });

    res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
};

export const getSubjectsByDepartment = async (req, res, next) => {
  try {
    const subjects = await Subject.find({
      department: req.params.departmentId,
      college: req.userCollege,
    }).sort({ name: 1 });

    res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const subject = await Subject.create({
      ...req.body,
      college: req.userCollege,
    });

    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, college: req.userCollege },
      req.body,
      { new: true, runValidators: true },
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      college: req.userCollege,
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    next(error);
  }
};
