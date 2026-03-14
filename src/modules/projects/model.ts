import { type Static, Type } from "@sinclair/typebox";

export interface CreateProjectBody {
  title: string;
  description?: string;
}

export interface ProjectListItem {
  id: number;
  title: string;
}

export const createProjectFormSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
});

export type InferCreateProjectFormSchema = Static<
  typeof createProjectFormSchema
>;
