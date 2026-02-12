import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const users = sqliteTable("posts", {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text(),
  content: text(),
});
