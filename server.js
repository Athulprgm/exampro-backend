import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/authroutes.js";
import collegeRoutes from "./routes/collegeroutes.js";
import departmentRoutes from "./routes/departmentroutes.js";
import subjectRoutes from "./routes/subjectroutes.js";
import studentRoutes from "./routes/studentroutes.js";
import teacherRoutes from "./routes/teacherroutes.js";
import roomRoutes from "./routes/roomroutes.js";
import examRoutes from "./routes/examroutes.js";
import seatRoutes from "./routes/seatroutes.js";
import malpracticeRoutes from "./routes/malpracticeroutes.js";
import mapRoutes from "./routes/maproutes.js";
import teacherAllocationRoutes from "./routes/teacherAllocation.routes.js";
import superAdminRoutes from "./routes/superAdmin.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads", "others")));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads", "students")),
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads", "teachers")),
);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);

app.use("/api/rooms", roomRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/malpractice", malpracticeRoutes);
app.use("/api/maps", mapRoutes);
app.use("/api/teacher-allocations", teacherAllocationRoutes);
app.use("/api/super-admin", superAdminRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large. Maximum size allowed is 20MB.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/examseatpro")
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`,
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server gracefully...");
  mongoose.connection.close();
  process.exit(0);
});

export default app;
