import { Router } from "express";
import { exportStudents, getExportFilters } from "../controllers/export.controller";
import { requireAuth, requireRoles } from "../middleware/auth";

export const exportRouter = Router();

exportRouter.get("/filters", requireAuth, requireRoles("SUPER_ADMIN"), getExportFilters);

exportRouter.post("/students", requireAuth, requireRoles("SUPER_ADMIN"), exportStudents);
