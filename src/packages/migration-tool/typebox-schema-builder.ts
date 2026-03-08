import fs from "node:fs";
import { type TSchema, Type } from "@sinclair/typebox";
import type { DatabaseSchema } from "./types";

export class TypeboxSchemaBuilder {
  private readonly databaseSchema: DatabaseSchema;
  private readonly dumpPath: string;

  constructor(dumpPath: string) {
    this.dumpPath = dumpPath;
    this.databaseSchema = JSON.parse(fs.readFileSync(this.dumpPath, "utf8"));
  }

  buildSelectSchema(tableName: string) {
    const difinition: Record<symbol | string, unknown> = {};
    const columns = this.databaseSchema[tableName];

    for (const column of columns) {
      let columnType: TSchema | undefined;

      if (column.type === "integer") {
        columnType = Type.Integer();
      }

      if (column.type === "number") {
        columnType = Type.Number();
      }

      if (column.type === "string") {
        columnType = Type.String();
      }

      if (
        columnType !== undefined &&
        column.primaryKey !== true &&
        column.nullable === true
      ) {
        columnType = Type.Optional(columnType);
      }

      difinition[column.name] = columnType;
    }

    const schema = Type.Object({ ...difinition } as Record<symbol, unknown>);

    return schema;
  }
}

if (import.meta.main) {
  const builder = new TypeboxSchemaBuilder("sqlite.test.schema.json");
  console.log(builder.buildSelectSchema("_migrations"));
}
