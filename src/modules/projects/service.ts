import { sql } from "bun";
import { TeamsService } from "@/modules/teams/service";
import type { CreateProjectBody, ProjectListItem } from "./model";

export const ProjectsService = {
  async createProject(
    userId: string,
    teamSlug: string,
    data: CreateProjectBody
  ): Promise<{ id: number }> {
    const teams = await TeamsService.getTeamsByUserId(userId);
    const team = teams.find((t) => t.slug === teamSlug);
    if (!team) {
      throw new Error("Team not found or access denied");
    }

    const title = data.title?.trim();
    if (!title) {
      throw new Error("Title is required");
    }

    const description = data.description?.trim() ?? "";
    const now = Math.floor(Date.now() / 1000);

    const projectData = {
      team_id: team.id,
      title,
      description,
      created_at: now,
      updated_at: now,
    };

    const [project] = await sql`
      INSERT INTO projects ${sql(projectData)}
      RETURNING id
    `;
    if (!project) {
      throw new Error("Failed to create project");
    }
    return { id: project.id };
  },

  async getProjectsByTeamSlug(
    userId: string,
    teamSlug: string
  ): Promise<ProjectListItem[]> {
    const teams = await TeamsService.getTeamsByUserId(userId);
    const team = teams.find((t) => t.slug === teamSlug);
    if (!team) {
      return [];
    }

    const result = await sql`
      SELECT id, title
      FROM projects
      WHERE team_id = ${team.id}
      ORDER BY title ASC
    `;
    return (Array.isArray(result) ? result : []) as ProjectListItem[];
  },

  async getProjectById(
    userId: string,
    projectId: number
  ): Promise<{ id: number; title: string; description: string } | null> {
    const [project] = await sql`
      SELECT p.id, p.title, p.description
      FROM projects p
      JOIN team_members tm ON p.team_id = tm.team_id AND tm.user_id = ${userId}
      WHERE p.id = ${projectId}
    `;
    return project as { id: number; title: string; description: string } | null;
  },
};
