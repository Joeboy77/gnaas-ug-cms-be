import { Router } from "express";
import { 
  getAttendanceReport, 
  getLevelReport, 
  getHallReport, 
  getGenderReport, 
  getMonthlyTrends, 
  exportReport 
} from "../controllers/reports.controller";
import { requireAuth, requireRole } from "../middleware/auth";

export const reportsRouter = Router();

// Report routes with authentication and role requirements
reportsRouter.get("/attendance", requireAuth, requireRole("SUPER_ADMIN"), getAttendanceReport);
reportsRouter.get("/levels", requireAuth, requireRole("SUPER_ADMIN"), getLevelReport);
reportsRouter.get("/halls", requireAuth, requireRole("SUPER_ADMIN"), getHallReport);
reportsRouter.get("/gender", requireAuth, requireRole("SUPER_ADMIN"), getGenderReport);
reportsRouter.get("/monthly-trends", requireAuth, requireRole("SUPER_ADMIN"), getMonthlyTrends);
reportsRouter.get("/export/:reportType", requireAuth, requireRole("SUPER_ADMIN"), exportReport);

export default reportsRouter;
