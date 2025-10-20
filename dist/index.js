"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
require("reflect-metadata");
const auth_router_1 = require("./routes/auth.router");
const admin_router_1 = require("./routes/admin.router");
const students_router_1 = require("./routes/students.router");
const attendance_router_1 = require("./routes/attendance.router");
const export_router_1 = require("./routes/export.router");
const reports_router_1 = require("./routes/reports.router");
const bulkUpload_router_1 = __importDefault(require("./routes/bulkUpload.router"));
dotenv_1.default.config();
const createApp = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.get("/health", (_req, res) => res.json({ status: "ok" }));
    app.use("/auth", auth_router_1.authRouter);
    app.use("/admin", admin_router_1.adminRouter);
    app.use("/students", students_router_1.studentsRouter);
    app.use("/attendance", attendance_router_1.attendanceRouter);
    app.use("/export", export_router_1.exportRouter);
    app.use("/reports", reports_router_1.reportsRouter);
    app.use("/bulk-upload", bulkUpload_router_1.default);
    return app;
};
exports.createApp = createApp;
// bootstrapping moved to src/bootstrap/server.ts
