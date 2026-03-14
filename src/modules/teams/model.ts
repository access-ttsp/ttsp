import { type Static, Type } from "@sinclair/typebox";

export interface CreateTeamBody {
  title: string;
  slug: string;
  description?: string;
}

export interface TeamWithRole {
  id: number;
  title: string;
  slug: string;
  description: string;
  role: "owner" | "admin" | "member" | "viewer";
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createTeamFormSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  slug: Type.String({ pattern: slugPattern.source }),
  description: Type.Optional(Type.String()),
});

export type InferCreateTeamFormSchema = Static<typeof createTeamFormSchema>;
