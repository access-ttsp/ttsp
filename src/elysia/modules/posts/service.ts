import { status } from "elysia";
import { sqlite } from "@/lib/sqlite";
import type { CreatePostBody, PostNotFound, UpdatePostBody } from "./model";

export const PostsService = {
  async getAllPosts() {
    const result = await sqlite`SELECT * FROM posts ORDER BY created_at DESC`;
    return Array.isArray(result) ? result : [];
  },

  async getPostById(id: number) {
    const [post] = await sqlite`SELECT * FROM posts WHERE id = ${id}`;

    if (!post) {
      throw status(404, "Post not found" satisfies PostNotFound);
    }

    return post;
  },

  async createPost(data: CreatePostBody) {
    const now = Date.now();
    const [post] = await sqlite`
      INSERT INTO posts (title, content, published, created_at, updated_at) 
      VALUES (${data.title}, ${data.content}, ${data.published}, ${now}, ${now})
      RETURNING *
    `;
    return post;
  },

  async updatePost(id: number, data: UpdatePostBody) {
    const now = Date.now();
    const [post] = await sqlite`
      UPDATE posts 
      SET title = ${data.title}, content = ${data.content}, published = ${data.published}, updated_at = ${now} 
      WHERE id = ${id}
      RETURNING *
    `;

    if (!post) {
      throw status(404, "Post not found" satisfies PostNotFound);
    }

    return post;
  },

  async deletePost(id: number) {
    const [post] = await sqlite`SELECT id FROM posts WHERE id = ${id}`;

    if (!post) {
      throw status(404, "Post not found" satisfies PostNotFound);
    }

    await sqlite`DELETE FROM posts WHERE id = ${id}`;
  },
};
