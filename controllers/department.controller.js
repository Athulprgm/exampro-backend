import Department from "../models/Department.model.js";

export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({
      college: req.userCollege,
    }).sort({ name: 1 });

    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const data = { ...req.body, college: req.userCollege };

    const department = await Department.create(data);

    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const data = { ...req.body };

    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, college: req.userCollege },
      data,
      { new: true, runValidators: true },
    );

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json(department);
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findOneAndDelete({
      _id: req.params.id,
      college: req.userCollege,
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    next(error);
  }
};
