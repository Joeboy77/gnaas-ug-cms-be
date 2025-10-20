"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
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
