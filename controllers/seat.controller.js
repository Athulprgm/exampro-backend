import SeatArrangement from "../models/SeatArrangement.model.js";
import User from "../models/User.model.js";
import Room from "../models/Room.model.js";
import Exam from "../models/Exam.model.js";

export const getArrangementByExam = async (req, res, next) => {
  try {
    const targetArrangement = await SeatArrangement.findOne({
      exam: req.params.examId,
      college: req.userCollege,
    }).populate("exam");

    if (!targetArrangement) {
      return res.status(404).json({ message: "Seat arrangement not found" });
    }

    if (!targetArrangement.exam) {
      return res.status(400).json({
        message:
          "The linked exam for this arrangement has been deleted. Please delete this arrangement and recreate it.",
      });
    }

    // Resolve the full slot context
    const examDate = new Date(targetArrangement.exam.date);
    const startOfDay = new Date(new Date(examDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(examDate).setHours(23, 59, 59, 999));
    const targetTime = targetArrangement.exam.time.trim();

    const slotExams = await Exam.find({
      college: req.userCollege,
      date: { $gte: startOfDay, $lte: endOfDay },
      time: targetTime,
    });

    const examIds = slotExams.map((e) => e._id);

    // Fetch all arrangements for this slot to provide a combined room view
    const slotArrangements = await SeatArrangement.find({
      exam: { $in: examIds },
      college: req.userCollege,
    })
      .populate("exam", "name subject paperName paperCode department semester")
      .populate(
        "halls.seats.student",
        "username registerNumber department subject",
      )
      .populate(
        "halls.seats.examRef",
        "name subject paperName paperCode department",
      )
      .populate("halls.room", "name capacity");

    // Merge logic: Combine halls from all arrangements in the slot
    const hallMap = {};

    slotArrangements.forEach((arr) => {
      arr.halls.forEach((hall) => {
        if (!hall.room) return; // Skip if room was deleted
        const roomId = hall.room._id.toString();
        if (!hallMap[roomId]) {
          hallMap[roomId] = {
            room: hall.room,
            name: hall.name,
            seats: [],
          };
        }
        // Add seats from this exam's arrangement
        hallMap[roomId].seats.push(...hall.seats);
      });
    });

    // Create a virtual arrangement object for the response
    const combinedArrangement = {
      ...targetArrangement.toObject(),
      halls: Object.values(hallMap).map((h) => ({
        ...h,
        // Sort seats to maintain original grid order if needed
        seats: h.seats.sort((a, b) => a.row - b.row || a.col - b.col),
      })),
      isCombinedView: slotArrangements.length > 1,
      totalExamsInSlot: slotArrangements.length,
    };

    res.status(200).json(combinedArrangement);
  } catch (error) {
    next(error);
  }
};

export const createArrangement = async (req, res, next) => {
  try {
    const { examId } = req.body;
    const collegeId = req.userCollege;

    // 1. Resolve Target and Slot Exams
    const selectedExam = await Exam.findById(examId);
    if (!selectedExam)
      return res.status(404).json({ message: "Exam not found" });

    const examDate = new Date(selectedExam.date);
    const startOfDay = new Date(new Date(examDate).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(examDate).setHours(23, 59, 59, 999));
    const targetTime = selectedExam.time.trim();

    const slotExams = await Exam.find({
      college: collegeId,
      date: { $gte: startOfDay, $lte: endOfDay },
      time: targetTime,
    });

    const normalize = (str) => (str || "").toLowerCase().replace(/[.\s-]/g, "");

    // 2. Fetch Global Student Pool for involved Semesters
    const semestersInSlot = [...new Set(slotExams.map((e) => e.semester))];
    const allEligibleStudents = await User.find({
      college: collegeId,
      role: "student",
      semester: { $in: semestersInSlot },
      isActive: true,
    });

    // 3. Mapping: Group students for each specific exam in the slot
    const studentsByExam = {};
    const globalAssignedIds = new Set();

    slotExams.forEach((ex) => {
      const eId = ex._id.toString();
      const eDept = normalize(ex.department);
      const eSub = normalize(ex.subject);

      const ePaper = normalize(ex.paperName);

      // 1. Mandatory match: Semester & Department
      const deptPool = allEligibleStudents.filter((s) => {
        const sSem = Number(s.semester);
        const sDept = normalize(s.department);
        return sSem === Number(ex.semester) && sDept === eDept;
      });

      // 2. Smart Matching (Subject -> Paper Name -> Full Dept):
      let matched = deptPool.filter((s) => normalize(s.subject) === eSub);

      if (matched.length === 0) {
        matched = deptPool.filter((s) => normalize(s.subject) === ePaper);
      }

      if (matched.length === 0) {
        matched = deptPool;
      }

      // 3. Prevent duplicate assignment within this slot
      const uniqueToExam = matched.filter(
        (s) => !globalAssignedIds.has(s._id.toString()),
      );
      uniqueToExam.forEach((s) => globalAssignedIds.add(s._id.toString()));

      studentsByExam[eId] = uniqueToExam.map((s) => s.toObject());
      console.log(
        `Exam ${ex.subject} mapped to ${studentsByExam[eId].length} students.`,
      );
    });

    // 4. Grouping by Department (Conflict Key)
    // We group by Department to ensure even different semesters in the same dept have gaps
    const conflictQueuesMap = {};
    slotExams.forEach((ex) => {
      const deptKey = normalize(ex.department);
      if (!conflictQueuesMap[deptKey]) {
        conflictQueuesMap[deptKey] = {
          key: deptKey,
          list: [],
        };
      }
      const students = studentsByExam[ex._id.toString()] || [];
      conflictQueuesMap[deptKey].list.push(
        ...students.map((s) => ({
          ...s,
          assignedExamId: ex._id.toString(),
        })),
      );
    });

    let queues = Object.values(conflictQueuesMap).filter(
      (q) => q.list.length > 0,
    );
    queues.sort((a, b) => b.list.length - a.list.length);

    if (queues.length === 0) {
      return res.status(400).json({
        message: "Conflict: No eligible students found for this slot.",
      });
    }

    // 5. Infrastructure Check & Cleanup
    const rooms = await Room.find({ college: collegeId, isActive: true }).sort({
      capacity: -1,
    });

    const examIds = slotExams.map((e) => e._id);
    // CRITICAL: Clear all existing arrangements for this slot to prevent overlapping data
    await SeatArrangement.deleteMany({
      exam: { $in: examIds },
      college: collegeId,
    });

    // 6. Master Blueprint Generation (Gap-Aware 2D Allocation)
    let masterBlueprint = [];
    let currentQueues = [...queues];

    for (const room of rooms) {
      if (currentQueues.length === 0) break;

      const roomBlueprint = [];
      const cols = 4; // Standard 4-seat bench/row layout
      const rows = Math.ceil(room.capacity / cols);
      const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const seatCount = r * cols + c;
          if (seatCount >= room.capacity) break;
          if (currentQueues.length === 0) break;

          // Adjacency Constraints (Same Dept = Conflict)
          const leftKey =
            c > 0 && grid[r][c - 1] ? grid[r][c - 1].conflictKey : null;
          const topKey =
            r > 0 && grid[r - 1][c] ? grid[r - 1][c].conflictKey : null;

          // Try to find a student who doesn't match left or top neighbor's department
          currentQueues.sort((a, b) => b.list.length - a.list.length);

          let targetQueueIdx = currentQueues.findIndex(
            (q) => q.key !== leftKey && q.key !== topKey,
          );

          // If no "safe" student found, leave the seat EMPTY (The Gap)
          if (targetQueueIdx === -1) {
            continue;
          }

          const queue = currentQueues[targetQueueIdx];
          const student = queue.list.shift();

          grid[r][c] = { conflictKey: queue.key };

          roomBlueprint.push({
            seatId: `${room.name}-R${r + 1}B${c < 2 ? 1 : 2}${c % 2 === 0 ? "A" : "B"}`,
            row: r,
            col: c,
            student: student._id,
            examRef: student.assignedExamId,
            isVerified: false,
          });

          // Refresh active queues
          currentQueues = currentQueues.filter((q) => q.list.length > 0);
        }
      }

      if (roomBlueprint.length > 0) {
        masterBlueprint.push({
          room: room._id,
          name: room.name,
          seats: roomBlueprint,
        });
      }
    }

    const totalStudents = queues.reduce(
      (sum, q) =>
        sum +
        (q.list.length +
          (queues.find((orig) => orig.key === q.key)?.originalLength || 0)),
      0,
    ); // This count is tricky, let's just use the original pool size
    const remainingCount = currentQueues.reduce(
      (sum, q) => sum + q.list.length,
      0,
    );

    if (remainingCount > 0) {
      return res.status(400).json({
        message: `Infrastructure limit with Gap Logic. ${remainingCount} students could not be seated. Please add more rooms or adjust slot constraints.`,
      });
    }

    // 7. Partitioning and Persistent Storage
    const saveOps = slotExams.map(async (exam) => {
      const eId = exam._id.toString();

      const examSpecificHalls = masterBlueprint
        .map((hall) => {
          const ownedSeats = hall.seats.filter(
            (s) => s.examRef.toString() === eId,
          );
          return { ...hall, seats: ownedSeats };
        })
        .filter((hall) => hall.seats.length > 0);

      if (examSpecificHalls.length === 0) return null;

      return SeatArrangement.create({
        exam: exam._id,
        college: collegeId,
        halls: examSpecificHalls,
        createdBy: req.user._id,
        status: "published",
      });
    });

    const results = await Promise.all(saveOps);
    const requestedArrangement = results.find(
      (a) => a && a.exam.toString() === examId,
    );

    res.status(201).json(requestedArrangement);
  } catch (error) {
    next(error);
  }
};

export const updateArrangement = async (req, res, next) => {
  try {
    const arrangement = await SeatArrangement.findOneAndUpdate(
      { _id: req.params.id, college: req.userCollege },
      req.body,
      { new: true, runValidators: true },
    );

    if (!arrangement) {
      return res.status(404).json({ message: "Arrangement not found" });
    }

    res.status(200).json(arrangement);
  } catch (error) {
    next(error);
  }
};

export const deleteArrangement = async (req, res, next) => {
  try {
    const targetArrangement = await SeatArrangement.findOne({
      _id: req.params.id,
      college: req.userCollege,
    }).populate("exam");

    if (!targetArrangement) {
      return res.status(404).json({ message: "Arrangement not found" });
    }

    if (!targetArrangement.exam) {
      // If exam is missing, just delete this arrangement and return
      await SeatArrangement.findByIdAndDelete(req.params.id);
      return res
        .status(200)
        .json({ message: "Dangling arrangement deleted successfully" });
    }

    // Find all exams at the same Date and Time slot
    const examDate = new Date(targetArrangement.exam.date);
    const startOfDay = new Date(examDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(examDate.setHours(23, 59, 59, 999));

    const slotExams = await Exam.find({
      college: req.userCollege,
      date: { $gte: startOfDay, $lte: endOfDay },
      time: targetArrangement.exam.time,
    });

    const examIds = slotExams.map((e) => e._id);

    // Delete all arrangements in this slot
    await SeatArrangement.deleteMany({
      exam: { $in: examIds },
      college: req.userCollege,
    });

    res.status(200).json({
      message: `Arrangement and all shared slot allocations (${slotExams.length} exams) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentSeat = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const studentId = req.user._id;

    const arrangement = await SeatArrangement.findOne({
      exam: examId,
      "halls.seats.student": studentId,
    })
      .populate("exam")
      .populate("halls.room", "name building floor");

    if (!arrangement) {
      return res.status(404).json({ message: "Seat not allocated yet" });
    }

    // Extract the specific seat for this student
    let studentSeat = null;
    let studentHall = null;

    for (const hall of arrangement.halls) {
      const seat = hall.seats.find(
        (s) => s.student.toString() === studentId.toString(),
      );
      if (seat) {
        studentSeat = seat;
        studentHall = hall;
        break;
      }
    }

    res.status(200).json({
      ...studentSeat.toObject(),
      hallName: studentHall.name,
      room: studentHall.room,
      exam: arrangement.exam,
    });
  } catch (error) {
    next(error);
  }
};
