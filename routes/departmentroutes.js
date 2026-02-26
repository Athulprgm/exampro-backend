import express from "express";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
import {
  protect,
  authorize,
  checkCollegeAccess,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(checkCollegeAccess);

router
  .route("/")
  .get(getAllDepartments)
  .post(authorize("admin"), createDepartment);

router
  .route("/:id")
  .put(authorize("admin"), updateDepartment)
  .delete(authorize("admin"), deleteDepartment);

export default router;
