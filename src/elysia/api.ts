import { Elysia } from "elysia";
import { authView } from "@/lib/auth-view";
import { sqliteController } from "./controllers/sqlite-controller";

export const api = new Elysia({ prefix: "/api" })
  .use(sqliteController)
  // ...
  // After all
  .all("/auth/*", authView);
