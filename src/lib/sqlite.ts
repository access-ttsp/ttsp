import { Database } from "bun:sqlite";
import { SQL } from "bun";
import { appConfig } from "@/app.config";

export const db = new Database(appConfig.DATABASE_URL);
export const sqlite = new SQL(db);
