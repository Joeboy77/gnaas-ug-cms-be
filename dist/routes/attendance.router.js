"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceRouter = void 0;
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const auth_1 = require("../middleware/auth");
exports.attendanceRouter = (0, express_1.Router)();
// Get attendance status for a date
exports.attendanceRouter.get("/status/:date", auth_1.requireAuth, attendance_controller_1.getAttendanceStatus);
// Get unmarked members for a date
exports.attendanceRouter.get("/unmarked-members/:date", auth_1.requireAuth, attendance_controller_1.getUnmarkedMembers);
// Mark member attendance
exports.attendanceRouter.post("/mark-member/:date", auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN", "SECRETARY"), attendance_controller_1.markMemberAttendance);
// Unmark member attendance
exports.attendanceRouter.delete("/unmark-member/:date/:studentId", auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN", "SECRETARY"), attendance_controller_1.unmarkMemberAttendance);
// Mark visitor attendance
exports.attendanceRouter.post("/mark-visitor/:date", auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN", "SECRETARY"), attendance_controller_1.markVisitorAttendance);
// Mark all members present for a date
exports.attendanceRouter.post("/mark-all/:date", auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN", "SECRETARY"), attendance_controller_1.markAllMembersPresent);
exports.attendanceRouter.post("/mark-all/undo/:actionId", auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN", "SECRETARY"), attendance_controller_1.undoMarkAllMembers);
// Undo individual attendance marking
exports.attendanceRouter.post("/individual/undo/:actionId", auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN", "SECRETARY"), attendance_controller_1.undoIndividualAttendance);
// Close attendance for a date
exports.attendanceRouter.post("/close/:date", auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN", "SECRETARY"), attendance_controller_1.closeAttendance);
// Get attendance summary for a date
exports.attendanceRouter.get("/summary/:date", auth_1.requireAuth, attendance_controller_1.getAttendanceSummary);
// Get members present for a date
exports.attendanceRouter.get("/members-present/:date", auth_1.requireAuth, attendance_controller_1.getMembersPresent);
// Get members absent for a date
exports.attendanceRouter.get("/members-absent/:date", auth_1.requireAuth, attendance_controller_1.getMembersAbsent);
// Get visitors for a date
exports.attendanceRouter.get("/visitors/:date", auth_1.requireAuth, attendance_controller_1.getVisitors);
// Get weekly attendance statistics
exports.attendanceRouter.get("/weekly-stats", auth_1.requireAuth, attendance_controller_1.getWeeklyAttendanceStats);
// Get monthly attendance trends
exports.attendanceRouter.get("/monthly-trends", auth_1.requireAuth, attendance_controller_1.getMonthlyAttendanceTrends);
