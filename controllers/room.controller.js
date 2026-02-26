import Room from "../models/Room.model.js";

export const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ college: req.userCollege }).sort({
      building: 1,
      name: 1,
    });
    res.status(200).json(rooms);
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create({
      ...req.body,
      college: req.userCollege,
    });
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, college: req.userCollege },
      req.body,
      { new: true, runValidators: true },
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findOneAndDelete({
      _id: req.params.id,
      college: req.userCollege,
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
};
