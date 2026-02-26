import express from "express";
import {
  registerCollege,
  getCollege,
  updateCollege,
  getAllColleges,
  deleteCollege,
  toggleCollegeStatus,
} from "../controllers/college.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerCollege);
router.get("/", protect, authorize("superadmin"), getAllColleges);
router.get("/:id", protect, getCollege);
router.put("/:id", protect, authorize("admin", "superadmin"), updateCollege);
router.delete("/:id", protect, authorize("superadmin"), deleteCollege);
router.patch(
  "/:id/status",
  protect,
  authorize("superadmin"),
  toggleCollegeStatus,
);

export default router;
