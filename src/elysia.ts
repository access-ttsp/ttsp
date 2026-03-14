import { Elysia } from "elysia";
import { authView } from "@/lib/auth-view";
import { posts } from "./modules/posts";
import { projectsRoutes } from "./modules/projects/routes";

export const api = new Elysia({ prefix: "/api" })
  .use(posts)
  .use(projectsRoutes)
  .all("/auth/*", authView);
