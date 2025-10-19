import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};
    console.log('Login attempt for email:', email);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: "email and password required" });
    }
    
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { email } });
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log('User found:', { id: user.id, email: user.email, role: user.role, fullName: user.fullName, profileImageUrl: user.profileImageUrl });
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log('Password comparison failed for user:', user.email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log('Password verified successfully for user:', user.email);
    
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || "devsecretjwt", { expiresIn: "7d" });
    
    const response = { token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName, profileImageUrl: user.profileImageUrl } };
    console.log('Login successful, returning response:', response);
    
    return res.json(response);
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).auth?.sub;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await userRepo.update(userId, { passwordHash: hashedNewPassword });

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}