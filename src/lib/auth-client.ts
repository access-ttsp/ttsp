import { createAuthClient } from "better-auth/react";
import { appConfig } from "@/app.config";

export const authClient = createAuthClient({
  baseURL: appConfig.BETTER_AUTH_URL,
});
