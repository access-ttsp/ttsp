import { sql } from "bun";
import { ProjectStatusesService } from "@/modules/project-statuses/service";
import { ProjectsService } from "@/modules/projects/service";
import type { CreateIssueBody, IssueView, UpdateIssueBody } from "./model";

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

    const statuses = await ProjectStatusesService.getStatusesByProjectId(
      userId,
      projectId
    );
    const statusBelongsToProject = statuses.some((s) => s.id === data.statusId);
    if (!statusBelongsToProject) {
      throw new Error("Invalid status");
    }

    const description = data.description?.trim() ?? "";
    const now = Math.floor(Date.now() / 1000);

    const [maxPriorityRow] = await sql`
      SELECT COALESCE(MAX(priority), -1) + 1 as next_priority
      FROM issues WHERE project_id = ${projectId} AND status_id = ${data.statusId}
    `;
    const priority = maxPriorityRow?.next_priority ?? 0;

    const issueData = {
      project_id: projectId,
      title,
      description,
      status_id: data.statusId,
      priority,
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
      SELECT i.id, i.project_id as "projectId", i.title, i.description, i.status_id as "statusId",
        pis.name as status, i.priority, i.created_at as "createdAt", i.updated_at as "updatedAt"
      FROM issues i
      JOIN project_issue_statuses pis ON i.status_id = pis.id
      JOIN projects p ON i.project_id = p.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE i.id = ${issueId}
    `;
    return issue as IssueView | null;
  },

  async getIssuesByProjectId(
    userId: string,
    projectId: number
  ): Promise<IssueView[]> {
    const issues = await sql`
      SELECT i.id, i.project_id as "projectId", i.title, i.description, i.status_id as "statusId",
        pis.name as status, i.priority, i.created_at as "createdAt", i.updated_at as "updatedAt"
      FROM issues i
      JOIN project_issue_statuses pis ON i.status_id = pis.id
      JOIN projects p ON i.project_id = p.id
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE i.project_id = ${projectId}
      ORDER BY pis.priority ASC, i.priority ASC, i.created_at DESC
    `;
    return (issues ?? []) as IssueView[];
  },

  async updateIssue(
    userId: string,
    issueId: number,
    data: UpdateIssueBody
  ): Promise<void> {
    const issue = await this.getIssueById(userId, issueId);
    if (!issue) {
      throw new Error("Issue not found or access denied");
    }

    const title = data.title?.trim();
    if (!title) {
      throw new Error("Title is required");
    }

    const statuses = await ProjectStatusesService.getStatusesByProjectId(
      userId,
      issue.projectId
    );
    const statusBelongsToProject = statuses.some((s) => s.id === data.statusId);
    if (!statusBelongsToProject) {
      throw new Error("Invalid status");
    }

    const description = data.description?.trim() ?? "";
    const now = Math.floor(Date.now() / 1000);

    await sql`
      UPDATE issues
      SET title = ${title}, description = ${description}, status_id = ${data.statusId}, updated_at = ${now}
      WHERE id = ${issueId}
    `;
  },

  async updateIssuesPrioritiesInStatus(
    userId: string,
    projectId: number,
    statusId: number,
    issueIds: number[]
  ): Promise<void> {
    const project = await ProjectsService.getProjectById(userId, projectId);
    if (!project) {
      throw new Error("Project not found or access denied");
    }
    const statuses = await ProjectStatusesService.getStatusesByProjectId(
      userId,
      projectId
    );
    const statusBelongsToProject = statuses.some((s) => s.id === statusId);
    if (!statusBelongsToProject) {
      throw new Error("Invalid status");
    }
    if (issueIds.length === 0) {
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i < issueIds.length; i++) {
      await sql`
        UPDATE issues
        SET priority = ${i}, updated_at = ${now}
        WHERE id = ${issueIds[i]} AND project_id = ${projectId} AND status_id = ${statusId}
      `;
    }
  },

  async moveIssueToStatus(
    userId: string,
    projectId: number,
    issueId: number,
    targetStatusId: number,
    targetIndex: number
  ): Promise<void> {
    const issue = await this.getIssueById(userId, issueId);
    if (!issue) {
      throw new Error("Issue not found or access denied");
    }
    if (issue.projectId !== projectId) {
      throw new Error("Issue does not belong to project");
    }
    const statuses = await ProjectStatusesService.getStatusesByProjectId(
      userId,
      projectId
    );
    const statusBelongsToProject = statuses.some(
      (s) => s.id === targetStatusId
    );
    if (!statusBelongsToProject) {
      throw new Error("Invalid target status");
    }

    const sourceStatusId = issue.statusId;
    const now = Math.floor(Date.now() / 1000);

    if (sourceStatusId === targetStatusId) {
      const issuesInStatus = await sql`
        SELECT id FROM issues
        WHERE project_id = ${projectId} AND status_id = ${targetStatusId}
        ORDER BY priority ASC, created_at DESC
      `;
      const ids = (issuesInStatus ?? []) as { id: number }[];
      const currentIndex = ids.findIndex((r) => r.id === issueId);
      if (currentIndex === -1 || currentIndex === targetIndex) {
        return;
      }
      const reordered = [...ids];
      const [removed] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, removed);
      const issueIds = reordered.map((r) => r.id);
      await this.updateIssuesPrioritiesInStatus(
        userId,
        projectId,
        targetStatusId,
        issueIds
      );
      return;
    }

    const issuesInTarget = await sql`
      SELECT id FROM issues
      WHERE project_id = ${projectId} AND status_id = ${targetStatusId}
      ORDER BY priority ASC, created_at DESC
    `;
    const targetIds = (issuesInTarget ?? []) as { id: number }[];
    const newOrder = [...targetIds.map((r) => r.id)];
    newOrder.splice(targetIndex, 0, issueId);

    await sql`
      UPDATE issues
      SET status_id = ${targetStatusId}, priority = ${targetIndex}, updated_at = ${now}
      WHERE id = ${issueId} AND project_id = ${projectId}
    `;

    for (let i = 0; i < newOrder.length; i++) {
      if (newOrder[i] === issueId) {
        continue;
      }
      await sql`
        UPDATE issues
        SET priority = ${i}, updated_at = ${now}
        WHERE id = ${newOrder[i]} AND project_id = ${projectId} AND status_id = ${targetStatusId}
      `;
    }

    const issuesInSource = await sql`
      SELECT id FROM issues
      WHERE project_id = ${projectId} AND status_id = ${sourceStatusId}
      ORDER BY priority ASC, created_at DESC
    `;
    const sourceIds = (issuesInSource ?? []) as { id: number }[];
    if (sourceIds.length > 0) {
      const sourceIssueIds = sourceIds.map((r) => r.id);
      await this.updateIssuesPrioritiesInStatus(
        userId,
        projectId,
        sourceStatusId,
        sourceIssueIds
      );
    }
  },
};
