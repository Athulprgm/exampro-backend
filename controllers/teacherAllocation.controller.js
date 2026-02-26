import TeacherAllocation from "../models/TeacherAllocation.model.js";
import Exam from "../models/Exam.model.js";

export const getAllAllocations = async (req, res, next) => {
  try {
    const allocations = await TeacherAllocation.find({
      college: req.userCollege,
    })
      .populate("teacher", "username email teacherId")
      .populate("room", "name")
      .populate("exam", "name date time subject paperName paperCode department")
      .sort({ createdAt: -1 });

    res.status(200).json(allocations);
  } catch (error) {
    next(error);
  }
};

export const createAllocation = async (req, res, next) => {
  try {
    const { exam: examId, teacher: teacherId, room: roomId } = req.body;

    // Fetch the target exam to get its date and time
    const targetExam = await Exam.findById(examId);
    if (!targetExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Check if the teacher is already allocated at the SAME Date and Time
    // We need to look at all allocations and check their associated exams
    const existingAllocations = await TeacherAllocation.find({
      college: req.userCollege,
    }).populate("exam");

    const conflict = existingAllocations.find((a) => {
      // Safety checks for dangling references (deleted exams, teachers, or rooms)
      if (!a.exam || !a.teacher || !a.room) return false;

      // Use a robust date string comparison
      const slotDate = new Date(a.exam.date).toISOString().split("T")[0];
      const targetDate = new Date(targetExam.date).toISOString().split("T")[0];

      const isSameSlot =
        slotDate === targetDate && a.exam.time === targetExam.time;

      if (!isSameSlot) return false;

      // Conflict if same teacher in different room OR same room with different teacher
      const isSameTeacher = a.teacher.toString() === teacherId?.toString();
      const isSameRoom = a.room.toString() === roomId?.toString();

      return isSameTeacher || isSameRoom;
    });

    if (conflict) {
      const isSameTeacher =
        conflict.teacher.toString() === teacherId?.toString();
      const reason = isSameTeacher
        ? "Teacher is already assigned to another room in this slot."
        : "This room is already assigned to another teacher in this slot.";
      return res.status(400).json({ message: reason });
    }

    const allocation = await TeacherAllocation.create({
      ...req.body,
      college: req.userCollege,
    });

    const populatedAllocation = await TeacherAllocation.findById(allocation._id)
      .populate("teacher", "username email teacherId")
      .populate("room", "name")
      .populate(
        "exam",
        "name date time subject paperName paperCode department",
      );

    res.status(201).json(populatedAllocation);
  } catch (error) {
    next(error);
  }
};

export const deleteAllocation = async (req, res, next) => {
  try {
    const allocation = await TeacherAllocation.findOneAndDelete({
      _id: req.params.id,
      college: req.userCollege,
    });

    if (!allocation) {
      return res.status(404).json({ message: "Allocation not found" });
    }

    res.status(200).json({ message: "Allocation deleted successfully" });
  } catch (error) {
    next(error);
  }
};
