"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const auth_1 = require("../middleware/auth");
exports.reportsRouter = (0, express_1.Router)();
// Report routes with authentication and role requirements
exports.reportsRouter.get("/attendance", auth_1.requireAuth, (0, auth_1.requireRole)("SUPER_ADMIN"), reports_controller_1.getAttendanceReport);
exports.reportsRouter.get("/levels", auth_1.requireAuth, (0, auth_1.requireRole)("SUPER_ADMIN"), reports_controller_1.getLevelReport);
exports.reportsRouter.get("/halls", auth_1.requireAuth, (0, auth_1.requireRole)("SUPER_ADMIN"), reports_controller_1.getHallReport);
exports.reportsRouter.get("/gender", auth_1.requireAuth, (0, auth_1.requireRole)("SUPER_ADMIN"), reports_controller_1.getGenderReport);
exports.reportsRouter.get("/monthly-trends", auth_1.requireAuth, (0, auth_1.requireRole)("SUPER_ADMIN"), reports_controller_1.getMonthlyTrends);
exports.reportsRouter.get("/export/:reportType", auth_1.requireAuth, (0, auth_1.requireRole)("SUPER_ADMIN"), reports_controller_1.exportReport);
exports.default = exports.reportsRouter;
