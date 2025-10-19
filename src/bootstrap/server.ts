import { AppDataSource } from "../data-source";
import { createApp } from "../index";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";

export async function startServer() {
  const port = process.env.PORT || 4000;
  await AppDataSource.initialize();
  const app = createApp();
  const repo = AppDataSource.getRepository(User);
  const existing = await repo.findOne({ where: { role: "SUPER_ADMIN" } });
  if (!existing) {
    const email = process.env.SEED_ADMIN_EMAIL || "admin@gnaas.local";
    const password = process.env.SEED_ADMIN_PASSWORD || "admin123";
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = repo.create({
      fullName: "Super Admin",
      email,
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
    console.log("Seeded Super Admin:", email);
  }
  app.listen(port, () => console.log(`BE listening on ${port}`));
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
}
