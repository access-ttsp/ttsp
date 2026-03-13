import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { appConfig } from "@/app.config";

const sqlite = new Database(appConfig.DATABASE_URL);
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: "./drizzle" });
