import express from "express";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";
import {
  protect,
  authorize,
  checkCollegeAccess,
} from "../middleware/auth.middleware.js";

import upload from "../utils/upload.js";

const router = express.Router();

router.use(protect);
router.use(checkCollegeAccess);

router
  .route("/")
  .get(getAllStudents)
  .post(authorize("admin", "teacher"), upload.single("photo"), createStudent);

router
  .route("/:id")
  .put(authorize("admin", "teacher"), upload.single("photo"), updateStudent)
  .delete(authorize("admin"), deleteStudent);

export default router;
