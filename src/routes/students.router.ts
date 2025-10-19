import { Router } from "express";
import { createStudent, listStudents, nextStudentCode, updateStudent, deleteStudent } from "../controllers/students.controller";
import { requireAuth, requireRoles } from "../middleware/auth";

export const studentsRouter = Router();

studentsRouter.get("/", requireAuth, listStudents);
studentsRouter.get("/next-code", requireAuth, nextStudentCode);
studentsRouter.post("/", requireAuth, requireRoles("SUPER_ADMIN", "SECRETARY"), createStudent);
studentsRouter.put("/:id", requireAuth, requireRoles("SUPER_ADMIN", "SECRETARY"), updateStudent);
studentsRouter.delete("/:id", requireAuth, requireRoles("SUPER_ADMIN"), deleteStudent);
