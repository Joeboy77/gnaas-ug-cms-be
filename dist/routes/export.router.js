"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRouter = void 0;
const express_1 = require("express");
const export_controller_1 = require("../controllers/export.controller");
const auth_1 = require("../middleware/auth");
exports.exportRouter = (0, express_1.Router)();
exports.exportRouter.get("/filters", auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN"), export_controller_1.getExportFilters);
exports.exportRouter.post("/students", auth_1.requireAuth, (0, auth_1.requireRoles)("SUPER_ADMIN"), export_controller_1.exportStudents);
