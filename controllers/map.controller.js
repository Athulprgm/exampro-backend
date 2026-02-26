import mongoose from "mongoose";
import BuildingMap from "../models/BuildingMap.model.js";
import SeatArrangement from "../models/SeatArrangement.model.js";
import User from "../models/User.model.js";

export const getFloors = async (req, res, next) => {
  try {
    const maps = await BuildingMap.find({ college: req.userCollege }).select(
      "floor",
    );
    const floors = maps.map((m) => m.floor).sort((a, b) => a - b);
    res.status(200).json(floors);
  } catch (error) {
    next(error);
  }
};

export const getMap = async (req, res, next) => {
  try {
    const { floor } = req.query;
    const map = await BuildingMap.findOne({
      college: req.userCollege,
      floor: parseInt(floor) || 0,
    });

    if (!map) {
      return res
        .status(200)
        .json({ nodes: [], edges: [], floor: parseInt(floor) || 0 });
    }

    res.status(200).json({
      nodes: map.nodes || [],
      edges: map.edges || [],
      floor: map.floor,
    });
  } catch (error) {
    next(error);
  }
};

export const saveMap = async (req, res, next) => {
  try {
    const { nodes, edges, floor } = req.body;
    const floorNum = parseInt(floor) || 0;

    if (!req.userCollege) {
      return res.status(400).json({
        success: false,
        message: "Session mismatch: College context is missing.",
      });
    }

    // Ultra-Strict Sanitization
    const sanitizedNodes = (nodes || []).map((node, index) => {
      // Validate basic geometry
      if (typeof node.x !== "number" || typeof node.y !== "number") {
        throw new Error(
          `Node at index ${index} has invalid coordinates (x: ${node.x}, y: ${node.y})`,
        );
      }
      if (!node.id) {
        throw new Error(`Node at index ${index} is missing a unique ID`);
      }

      const cleanNode = {
        id: String(node.id),
        type: ["room", "entrance", "stair", "node"].includes(node.type)
          ? node.type
          : "node",
        x: Number(node.x),
        y: Number(node.y),
        label: node.label ? String(node.label) : "",
      };

      // Strict ObjectId validation for roomId
      if (
        node.roomId &&
        node.roomId !== "" &&
        mongoose.Types.ObjectId.isValid(node.roomId)
      ) {
        cleanNode.roomId = node.roomId;
      }

      return cleanNode;
    });

    const sanitizedEdges = (edges || [])
      .filter((e) => e.from && e.to)
      .map((edge) => ({
        from: String(edge.from),
        to: String(edge.to),
      }));

    // Use updateOne w/ upsert
    const result = await BuildingMap.updateOne(
      { college: req.userCollege, floor: floorNum },
      {
        $set: {
          nodes: sanitizedNodes,
          edges: sanitizedEdges,
          updatedBy: req.user._id,
        },
      },
      { upsert: true, runValidators: true },
    );

    // Fetch result
    const updatedMap = await BuildingMap.findOne({
      college: req.userCollege,
      floor: floorNum,
    });

    res.status(200).json({
      success: true,
      nodes: updatedMap.nodes || [],
      edges: updatedMap.edges || [],
      floor: updatedMap.floor,
    });
  } catch (error) {
    console.error("SHUTDOWN PREVENTED - SAVE MAP ERROR:", error);
    res.status(500).json({
      success: false,
      message:
        error.name === "ValidationError"
          ? "Schema Validation Error"
          : error.message || "Internal Persistence Fault",
      details: error.errors
        ? Object.values(error.errors).map((e) => e.message)
        : error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const deleteMap = async (req, res, next) => {
  try {
    const { floor } = req.query;
    const map = await BuildingMap.findOneAndDelete({
      college: req.userCollege,
      floor: parseInt(floor) || 0,
    });

    if (!map) {
      return res
        .status(404)
        .json({ message: "Building map for this floor not found" });
    }

    res.status(200).json({ message: "Map deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getStudentRoute = async (req, res, next) => {
  try {
    const { rollNumber } = req.params;

    // 1. Find Student (Case-insensitive search)
    const student = await User.findOne({
      registerNumber: { $regex: new RegExp(`^${rollNumber}$`, "i") },
      role: "student",
      college: req.userCollege,
    });

    if (!student) {
      return res
        .status(404)
        .json({ message: "Student not found with this Roll Number" });
    }

    // 2. Find Seat Arrangement
    const { examId } = req.query;
    const query = {
      "halls.seats.student": student._id,
      status: "published",
    };

    if (examId && mongoose.Types.ObjectId.isValid(examId)) {
      query.exam = examId;
    }

    const arrangement = await SeatArrangement.findOne(query)
      .populate("halls.room")
      .populate("exam")
      .sort({ createdAt: -1 }); // Get the latest one if multiple exist

    if (!arrangement) {
      return res
        .status(404)
        .json({ message: "No active seat allocation found for this student" });
    }

    // 3. Find Room in Arrangement
    let targetHall = null;
    for (const hall of arrangement.halls) {
      const hasSeat = hall.seats.some(
        (s) => s.student.toString() === student._id.toString(),
      );
      if (hasSeat) {
        targetHall = hall;
        break;
      }
    }

    if (!targetHall || !targetHall.room) {
      return res
        .status(404)
        .json({ message: "Room details missing in allocation" });
    }

    const targetRoom = targetHall.room;
    const floorNum = parseInt(targetRoom.floor) || 0;

    // 4. Find Node ID in Map for that specific floor
    const map = await BuildingMap.findOne({
      college: req.userCollege,
      floor: floorNum,
    });

    let roomNodeId = null;
    let roomLabel = targetRoom.roomNumber || targetRoom.name;

    if (map && map.nodes) {
      const linkedNode = map.nodes.find(
        (n) =>
          (n.roomId && n.roomId.toString() === targetRoom._id.toString()) ||
          (n.label && n.label.toLowerCase() === roomLabel.toLowerCase()),
      );
      if (linkedNode) {
        roomNodeId = linkedNode.id;
      }
    }

    res.status(200).json({
      roomId: roomNodeId,
      roomLabel: roomLabel,
      floor: floorNum,
      studentInfo: {
        name: student.username,
        roll: student.registerNumber,
        dept: student.department,
      },
    });
  } catch (error) {
    next(error);
  }
};
