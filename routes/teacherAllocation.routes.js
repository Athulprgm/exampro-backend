import express from "express";
import {
  getAllAllocations,
  createAllocation,
  deleteAllocation,
} from "../controllers/teacherAllocation.controller.js";
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
  .get(getAllAllocations) // Teachers might need to see this too? Let's assume admin for now, or allow all authorized users
  .post(authorize("admin"), createAllocation);

router.route("/:id").delete(authorize("admin"), deleteAllocation);

export default router;
