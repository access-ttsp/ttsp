import { Type } from "@sinclair/typebox";

export const projectIdParamsSchema = Type.Object({
  id: Type.Number(),
});
