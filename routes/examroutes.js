import express from "express";
import {
  getAllExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
} from "../controllers/exam.controller.js";
import {
  protect,
  authorize,
  checkCollegeAccess,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(checkCollegeAccess);

router.route("/").get(getAllExams).post(authorize("admin"), createExam);

router
  .route("/:id")
  .get(getExam)
  .put(authorize("admin"), updateExam)
  .delete(authorize("admin"), deleteExam);

export default router;
