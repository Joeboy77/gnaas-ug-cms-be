import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || "gnaas",
  password: process.env.DB_PASSWORD || "gnaas",
  database: process.env.DB_NAME || "gnaas_cms_dev",
  entities: [__dirname + "/entities/**/*.{ts,js}"],
  migrations: [__dirname + "/migrations/**/*.{ts,js}"],
  synchronize: true,
});
