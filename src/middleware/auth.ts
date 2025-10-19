import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  sub: string;
  role: "SUPER_ADMIN" | "SECRETARY";
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecretjwt") as AuthPayload;
    (req as any).auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireRole(role: AuthPayload["role"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth as AuthPayload | undefined;
    if (!auth || auth.role !== role) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

export function requireRoles(...roles: AuthPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth as AuthPayload | undefined;
    if (!auth || !roles.includes(auth.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
