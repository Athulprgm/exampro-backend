import express from "express";
import {
  getAllSubjects,
  getSubjectsByDepartment,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.controller.js";
import {
  protect,
  authorize,
  checkCollegeAccess,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(checkCollegeAccess);

router.route("/").get(getAllSubjects).post(authorize("admin"), createSubject);

router.get("/department/:departmentId", getSubjectsByDepartment);

router
  .route("/:id")
  .put(authorize("admin"), updateSubject)
  .delete(authorize("admin"), deleteSubject);

export default router;
