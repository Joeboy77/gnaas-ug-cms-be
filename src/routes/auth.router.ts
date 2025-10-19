import { Router } from "express";
import { login, changePassword } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/change-password", requireAuth, changePassword);