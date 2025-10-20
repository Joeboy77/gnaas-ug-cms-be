"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
exports.requireRoles = requireRoles;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : null;
        if (!token)
            return res.status(401).json({ message: "Unauthorized" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "devsecretjwt");
        req.auth = decoded;
        return next();
    }
    catch {
        return res.status(401).json({ message: "Unauthorized" });
    }
}
function requireRole(role) {
    return (req, res, next) => {
        const auth = req.auth;
        if (!auth || auth.role !== role)
            return res.status(403).json({ message: "Forbidden" });
        next();
    };
}
function requireRoles(...roles) {
    return (req, res, next) => {
        const auth = req.auth;
        if (!auth || !roles.includes(auth.role))
            return res.status(403).json({ message: "Forbidden" });
        next();
    };
}
