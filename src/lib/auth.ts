/**
 * @link https://www.better-auth.com/docs/installation
 *
 * PostgreSQL configuration example
 *
 * import { betterAuth } from "better-auth";
 * import { Pool } from "pg";
 *
 * export const auth = betterAuth({
 *   database: new Pool({
 *     connectionString: appConfig.BETTER_AUTH_DATABASE_URL,
 *   }),
 * });
 */
import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { appConfig } from "@/app.config";

const database = new Database(appConfig.BETTER_AUTH_DATABASE_URL);

export const auth = betterAuth({
  database,
  emailAndPassword: {
    enabled: true,
  },
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID as string,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  //   },
  // },
});
