import express from "express";
import {
  getMap,
  saveMap,
  deleteMap,
  getStudentRoute,
  getFloors,
} from "../controllers/map.controller.js";
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
  .get(getMap)
  .post(authorize("admin"), saveMap)
  .delete(authorize("admin"), deleteMap);

router.route("/floors").get(getFloors);
router.route("/route/:rollNumber").get(getStudentRoute);

export default router;
