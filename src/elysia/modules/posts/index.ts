import { Elysia } from "elysia";
import { PostsModel } from "./model";
import { PostsService } from "./service";

export const posts = new Elysia({ prefix: "/posts" })

  /**
   * GET /posts - Get all posts ordered by created_at DESC
   */
  .get("/", async () => {
    return await PostsService.getAllPosts();
  })

  /**
   * GET /posts/:id - Get a single post by id
   */
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return await PostsService.getPostById(Number(id));
    },
    {
      response: {
        200: PostsModel.selectSchema,
        404: PostsModel.postNotFound,
      },
    }
  )

  /**
   * POST /posts - Create a new post
   */
  .post(
    "/",
    async ({ body }) => {
      return await PostsService.createPost(body);
    },
    {
      body: PostsModel.createPostBody,
      response: {
        200: PostsModel.createPostResponse,
      },
    }
  )

  /**
   * PUT /posts/:id - Update an existing post
   */
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      return await PostsService.updatePost(Number(id), body);
    },
    {
      body: PostsModel.updatePostBody,
      response: {
        200: PostsModel.updatePostResponse,
        404: PostsModel.postNotFound,
      },
    }
  )

  /**
   * DELETE /posts/:id - Delete a post
   */
  .delete(
    "/:id",
    async ({ params: { id } }) => {
      await PostsService.deletePost(Number(id));
      return { success: true };
    },
    {
      response: {
        200: PostsModel.deletePostResponse,
        404: PostsModel.postNotFound,
      },
    }
  );
