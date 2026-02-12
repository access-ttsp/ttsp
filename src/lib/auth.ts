/**
 * @link https://www.better-auth.com/docs/installation
 */

import { Database } from "bun:sqlite";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { appConfig } from "@/app.config";

const database = new Database(appConfig.BETTER_AUTH_DATABASE_URL);

export const auth = betterAuth({
  database,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
