import { t } from "elysia";
import { postsSelectSchema } from "@/db/schema/posts";

// Body schemas for validation
const createPostBody = t.Object({
  title: t.String({ minLength: 1 }),
  content: t.String(),
  published: t.Boolean(),
});

export type CreatePostBody = typeof createPostBody.static;

const updatePostBody = t.Object({
  title: t.String({ minLength: 1 }),
  content: t.String(),
  published: t.Boolean(),
});

export type UpdatePostBody = typeof updatePostBody.static;

// Response schemas
export type PostSelectSchema = typeof postsSelectSchema.static;

const createPostResponse = postsSelectSchema;
export type CreatePostResponse = typeof createPostResponse.static;

const updatePostResponse = postsSelectSchema;
export type UpdatePostResponse = typeof updatePostResponse.static;

const deletePostResponse = t.Object({
  success: t.Boolean(),
});

export type DeletePostResponse = typeof deletePostResponse.static;

// Error schemas
const postNotFound = t.Literal("Post not found");
export type PostNotFound = typeof postNotFound.static;

const postValidationError = t.Object({
  message: t.String(),
});

export type PostValidationError = typeof postValidationError.static;

// Export PostsModel object containing all schemas
export const PostsModel = {
  createPostBody,
  updatePostBody,
  createPostResponse,
  updatePostResponse,
  deletePostResponse,
  postNotFound,
  postValidationError,
};
