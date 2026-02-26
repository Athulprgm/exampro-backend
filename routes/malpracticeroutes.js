import express from "express";
import {
  getAllMalpractices,
  searchStudent,
  reportMalpractice,
  updateMalpractice,
  deleteMalpractice,
} from "../controllers/malpractice.controller.js";
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
  .get(authorize("admin", "teacher"), getAllMalpractices)
  .post(authorize("admin", "teacher"), reportMalpractice);

router.get("/search", searchStudent);

router
  .route("/:id")
  .put(authorize("admin"), updateMalpractice)
  .delete(authorize("admin"), deleteMalpractice);

export default router;
