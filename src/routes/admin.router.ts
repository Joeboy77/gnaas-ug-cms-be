import { Router } from "express";
import { 
  listUsers,
  syncSecretaryProfileImages,
  createSecretary, 
  promoteStudents, 
  getAlumniEligibleStudents,
  getAttendanceInsights,
  getGenderDistribution,
  getHallDistribution,
  getAvailableLevels,
  getValidPromotionTargets
} from "../controllers/admin.controller";
import { requireAuth, requireRole } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.get("/users", requireAuth, requireRole("SUPER_ADMIN"), listUsers);
adminRouter.post("/sync-profile-images", requireAuth, requireRole("SUPER_ADMIN"), syncSecretaryProfileImages);
adminRouter.post("/secretaries", requireAuth, requireRole("SUPER_ADMIN"), createSecretary);
adminRouter.post("/promote-students", requireAuth, requireRole("SUPER_ADMIN"), promoteStudents);
adminRouter.get("/alumni-eligible", requireAuth, requireRole("SUPER_ADMIN"), getAlumniEligibleStudents);
adminRouter.get("/attendance-insights", requireAuth, requireRole("SUPER_ADMIN"), getAttendanceInsights);
adminRouter.get("/gender-distribution", requireAuth, requireRole("SUPER_ADMIN"), getGenderDistribution);
adminRouter.get("/hall-distribution", requireAuth, requireRole("SUPER_ADMIN"), getHallDistribution);
adminRouter.get("/available-levels", requireAuth, requireRole("SUPER_ADMIN"), getAvailableLevels);
adminRouter.get("/valid-promotion-targets", requireAuth, requireRole("SUPER_ADMIN"), getValidPromotionTargets);