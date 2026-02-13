import { Elysia } from "elysia";
import { authView } from "@/lib/auth-view";
import { posts } from "./modules/posts";

export const api = new Elysia({ prefix: "/api" })
  .use(posts)
  // ...
  // After all
  .all("/auth/*", authView);
