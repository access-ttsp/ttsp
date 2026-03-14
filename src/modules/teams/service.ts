import { sql } from "bun";
import type { CreateTeamBody, TeamWithRole } from "./model";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const TeamsService = {
  async getTeamsByUserId(userId: string): Promise<TeamWithRole[]> {
    const result = await sql`
      SELECT t.id, t.title, t.slug, t.description, tm.role
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = ${userId}
      ORDER BY t.title ASC
    `;
    return (Array.isArray(result) ? result : []) as TeamWithRole[];
  },

  async createTeam(
    userId: string,
    data: CreateTeamBody
  ): Promise<TeamWithRole> {
    const title = data.title?.trim();
    if (!title) {
      throw new Error("Title is required");
    }

    const slug = data.slug?.toLowerCase().trim() ?? "";
    if (!slug) {
      throw new Error("Slug is required");
    }
    if (!SLUG_REGEX.test(slug)) {
      throw new Error(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
    }

    const [existing] = await sql`
      SELECT id FROM teams WHERE slug = ${slug}
    `;
    if (existing) {
      throw new Error("A team with this slug already exists");
    }

    const description = data.description?.trim() ?? "";
    const now = Math.floor(Date.now() / 1000);

    const [team] = await sql.begin(async (tx) => {
      const [inserted] = await tx`
        INSERT INTO teams (owner_user_id, title, slug, description, created_at, updated_at)
        VALUES (${userId}, ${title}, ${slug}, ${description}, ${now}, ${now})
        RETURNING id, title, slug, description
      `;
      if (!inserted) {
        throw new Error("Failed to create team");
      }
      await tx`
        INSERT INTO team_members (user_id, team_id, role)
        VALUES (${userId}, ${inserted.id}, 'owner')
      `;
      return [{ ...inserted, role: "owner" as const }];
    });
    if (!team) {
      throw new Error("Failed to create team");
    }
    return team as TeamWithRole;
  },
};
