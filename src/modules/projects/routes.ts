import { Elysia } from "elysia";
import { auth } from "@/lib/auth";
import { authEnsureSession } from "@/lib/ensure-user-in-app-db";
import { IssuesService } from "@/modules/issues/service";
import { projectIdParamsSchema } from "./model";

export const projectsRoutes = new Elysia({ prefix: "/projects" }).get(
  "/:id/issues",
  async ({ params: { id }, request }) => {
    const session = await authEnsureSession(
      request.headers,
      auth.api.getSession
    );
    const issues = await IssuesService.getIssuesByProjectId(
      session.user.id,
      id
    );
    return issues;
  },
  {
    params: projectIdParamsSchema,
  }
);
