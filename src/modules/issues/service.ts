import { sql } from "bun";
import { ProjectsService } from "@/modules/projects/service";
import type { CreateIssueBody, IssueView } from "./model";

export const IssuesService = {
  async createIssue(
    userId: string,
    projectId: number,
    data: CreateIssueBody
  ): Promise<{ id: number }> {
    const project = await ProjectsService.getProjectById(userId, projectId);
    if (!project) {
      throw new Error("Project not found or access denied");
    }

    const title = data.title?.trim();
    if (!title) {
      throw new Error("Title is required");
    }

    const description = data.description?.trim() ?? "";
    const status = data.status?.trim() ?? "backlog";
    const now = Math.floor(Date.now() / 1000);

    const issueData = {
      project_id: projectId,
      title,
      description,
      status,
      created_at: now,
      updated_at: now,
    };

    const [issue] = await sql`
      INSERT INTO issues ${sql(issueData)}
      RETURNING id
    `;
    if (!issue) {
      throw new Error("Failed to create issue");
    }
    return { id: issue.id };
  },

  async getIssueById(
    userId: string,
    issueId: number
  ): Promise<IssueView | null> {
    const [issue] = await sql`
      SELECT i.id, i.project_id as "projectId", i.title, i.description, i.status,
        i.created_at as "createdAt", i.updated_at as "updatedAt"
      FROM issues i
      JOIN projects p ON i.project_id = p.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE i.id = ${issueId}
    `;
    return issue as IssueView | null;
  },
};
