import { AppDataSource } from "../data-source";
import { createApp } from "../index";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";

export async function startServer() {
  const port = process.env.PORT || 4000;
  await AppDataSource.initialize();
  const app = createApp();
  const repo = AppDataSource.getRepository(User);
  
  // Check if any super admin exists
  const existingAdmin = await repo.findOne({ where: { role: "SUPER_ADMIN" } });
  if (!existingAdmin) {
    // Create 3 super admins
    const superAdmins = [
      {
        fullName: "Super Admin",
        email: process.env.SEED_ADMIN_EMAIL || "admin@gnaas.local",
        password: process.env.SEED_ADMIN_PASSWORD || "admin123456",
      },
      {
        fullName: "John Admin",
        email: "it1.admin@gnaas.local",
        password: "john123456",
      },
      {
        fullName: "Sarah Admin",
        email: "it2.admin@gnaas.local",
        password: "sarah123456",
      }
    ];

    for (const adminData of superAdmins) {
      const passwordHash = await bcrypt.hash(adminData.password, 10);
      const admin = repo.create({
        fullName: adminData.fullName,
        email: adminData.email,
        role: "SUPER_ADMIN",
        passwordHash,
        level: null,
        hall: null,
        programDurationYears: null,
        dateOfAdmission: null,
        phone: null,
        profileImageUrl: null,
      });
      await repo.save(admin);
      console.log(`Seeded Super Admin: ${adminData.email} (Password: ${adminData.password})`);
    }
  }
  
  app.listen(port, () => console.log(`BE listening on ${port}`));
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
}
