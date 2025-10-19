import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "reflect-metadata";
import { authRouter } from "./routes/auth.router";
import { adminRouter } from "./routes/admin.router";
import { studentsRouter } from "./routes/students.router";
import { attendanceRouter } from "./routes/attendance.router";
import { exportRouter } from "./routes/export.router";
import { reportsRouter } from "./routes/reports.router";

dotenv.config();

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);
  app.use("/students", studentsRouter);
  app.use("/attendance", attendanceRouter);
  app.use("/export", exportRouter);
  app.use("/reports", reportsRouter);
  return app;
};

// bootstrapping moved to src/bootstrap/server.ts
