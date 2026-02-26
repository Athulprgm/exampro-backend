import express from "express";
import {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";
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
  .get(getAllTeachers)
  .post(authorize("admin"), upload.single("photo"), createTeacher);

router
  .route("/:id")
  .put(authorize("admin"), upload.single("photo"), updateTeacher)
  .delete(authorize("admin"), deleteTeacher);

export default router;
