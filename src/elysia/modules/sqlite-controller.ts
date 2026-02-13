import { Elysia } from "elysia";
import { sqlite } from "@/lib/sqlite";

export const sqliteController = new Elysia({ prefix: "/sqlite" })

  /**
   * Gets posts
   */
  .get("/", () => {
    return sqlite`SELECT * FROM posts`;
  })

  /**
   * Adds new post
   */
  .post("/", () => {
    const data = {
      title: "Hello World",
      content: "This is a test post",
    };
    return sqlite`INSERT INTO posts ${sqlite(data)}`;
  });
