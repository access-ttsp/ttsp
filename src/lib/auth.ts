/**
 * @link https://www.better-auth.com/docs/installation
 */

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
import { appConfig } from "@/app.config";

export const auth = betterAuth({
  database: new Pool({
    connectionString: appConfig.BETTER_AUTH_DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    admin({
      adminUserIds: [],
    }),
  ],
});
