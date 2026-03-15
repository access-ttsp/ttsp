import { Type } from "@sinclair/typebox";

export const projectIdParamsSchema = Type.Object({
  id: Type.Number(),
});

export const reorderIssuesBodySchema = Type.Object({
  issueIds: Type.Array(Type.Number()),
});

export const issueCommentsParamsSchema = Type.Object({
  id: Type.Number(),
  issueId: Type.Number(),
});

export interface ReorderIssuesBody {
  issueIds: number[];
}
