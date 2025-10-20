import { Router } from "express";
import { 
  getAttendanceStatus, 
  getUnmarkedMembers, 
  markMemberAttendance, 
  markVisitorAttendance, 
  closeAttendance, 
  getAttendanceSummary,
  getMembersPresent,
  getMembersAbsent,
  getVisitors,
  getWeeklyAttendanceStats,
  getMonthlyAttendanceTrends,
  markAllMembersPresent,
  undoMarkAllMembers,
  undoIndividualAttendance,
  unmarkMemberAttendance
} from "../controllers/attendance.controller";
import { requireAuth, requireRoles } from "../middleware/auth";

export const attendanceRouter = Router();

// Get attendance status for a date
attendanceRouter.get("/status/:date", requireAuth, getAttendanceStatus);

// Get unmarked members for a date
attendanceRouter.get("/unmarked-members/:date", requireAuth, getUnmarkedMembers);

// Mark member attendance
attendanceRouter.post("/mark-member/:date", requireAuth, requireRoles("SUPER_ADMIN", "SECRETARY"), markMemberAttendance);

// Unmark member attendance
attendanceRouter.delete("/unmark-member/:date/:studentId", requireAuth, requireRoles("SUPER_ADMIN", "SECRETARY"), unmarkMemberAttendance);

// Mark visitor attendance
attendanceRouter.post("/mark-visitor/:date", requireAuth, requireRoles("SUPER_ADMIN", "SECRETARY"), markVisitorAttendance);

// Mark all members present for a date
attendanceRouter.post("/mark-all/:date", requireAuth, requireRoles("SUPER_ADMIN", "SECRETARY"), markAllMembersPresent);
attendanceRouter.post("/mark-all/undo/:actionId", requireAuth, requireRoles("SUPER_ADMIN", "SECRETARY"), undoMarkAllMembers);

// Undo individual attendance marking
attendanceRouter.post("/individual/undo/:actionId", requireAuth, requireRoles("SUPER_ADMIN", "SECRETARY"), undoIndividualAttendance);

// Close attendance for a date
attendanceRouter.post("/close/:date", requireAuth, requireRoles("SUPER_ADMIN", "SECRETARY"), closeAttendance);

// Get attendance summary for a date
attendanceRouter.get("/summary/:date", requireAuth, getAttendanceSummary);

// Get members present for a date
attendanceRouter.get("/members-present/:date", requireAuth, getMembersPresent);

// Get members absent for a date
attendanceRouter.get("/members-absent/:date", requireAuth, getMembersAbsent);

// Get visitors for a date
attendanceRouter.get("/visitors/:date", requireAuth, getVisitors);

// Get weekly attendance statistics
attendanceRouter.get("/weekly-stats", requireAuth, getWeeklyAttendanceStats);

// Get monthly attendance trends
attendanceRouter.get("/monthly-trends", requireAuth, getMonthlyAttendanceTrends);