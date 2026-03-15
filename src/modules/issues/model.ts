import { type Static, Type } from "@sinclair/typebox";

export interface CreateIssueBody {
  title: string;
  description?: string;
  status?: string;
}

export interface UpdateIssueBody {
  title: string;
  description?: string;
  status?: string;
}

export interface IssueView {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: string;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

export const createIssueFormSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
});

export type InferCreateIssueFormSchema = Static<typeof createIssueFormSchema>;

export const updateIssueFormSchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
});

export type InferUpdateIssueFormSchema = Static<typeof updateIssueFormSchema>;
