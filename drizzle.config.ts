import { defineConfig } from "drizzle-kit";
import { appConfig } from "@/app.config";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/sqlite/*.ts",
  out: "./drizzle",
  dbCredentials: {
    url: appConfig.DATABASE_URL,
  },
});
