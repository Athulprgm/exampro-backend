import express from "express";
import {
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
  updateProfile,
  updatePassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/update-profile", protect, updateProfile);
router.put("/update-password", protect, updatePassword);

export default router;
