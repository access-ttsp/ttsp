import { integer, serial, pgTable as table, text } from "drizzle-orm/pg-core";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";

import { projectsTable } from "./projects";

export const issuesTable = table("issues", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("backlog"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const issuesInsertSchema = createInsertSchema(issuesTable);
export const issuesSelectSchema = createSelectSchema(issuesTable);
export const issuesUpdateSchema = createUpdateSchema(issuesTable);
