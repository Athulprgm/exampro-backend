import express from "express";
import {
  getArrangementByExam,
  createArrangement,
  updateArrangement,
  deleteArrangement,
  getStudentSeat,
} from "../controllers/seat.controller.js";
import {
  protect,
  authorize,
  checkCollegeAccess,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(checkCollegeAccess);

router.get("/exam/:examId", getArrangementByExam);
router.get("/student/:examId", getStudentSeat);

router.route("/").post(authorize("admin"), createArrangement);

router
  .route("/:id")
  .put(authorize("admin"), updateArrangement)
  .delete(authorize("admin"), deleteArrangement);

export default router;
