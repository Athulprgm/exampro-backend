import express from "express";
import {
  getAllColleges,
  updateCollege,
  deleteCollege,
  getCollegeAdmins,
} from "../controllers/superAdmin.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes here require superadmin role
router.use(protect);
router.use(authorize("superadmin"));

router.route("/colleges").get(getAllColleges);

router.route("/colleges/:id").put(updateCollege).delete(deleteCollege);

router.route("/colleges/:id/admins").get(getCollegeAdmins);

export default router;
