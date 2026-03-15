import { Type } from "@sinclair/typebox";

export const projectIdParamsSchema = Type.Object({
  id: Type.Number(),
});

export const issueCommentsParamsSchema = Type.Object({
  id: Type.Number(),
  issueId: Type.Number(),
});
