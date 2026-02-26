import express from "express";
import {
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../controllers/room.controller.js";
import {
  protect,
  authorize,
  checkCollegeAccess,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(checkCollegeAccess);

router.route("/").get(getAllRooms).post(authorize("admin"), createRoom);

router
  .route("/:id")
  .put(authorize("admin"), updateRoom)
  .delete(authorize("admin"), deleteRoom);

export default router;
