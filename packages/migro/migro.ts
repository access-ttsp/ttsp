import { Database as SQLiteDatabase } from "bun:sqlite";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { SQLQuery } from "bun";
import { SQL, sql } from "bun";

type BunSQLClient = typeof sql | SQL;

interface MigroOptions {
  migrationsFolder: string;
  databaseType: "postgresql" | "sqlite";
  tableName?: string;
  sqliteDbPath?: string;
  pgConnectionString?: string;
}

export class Migro {
  private readonly client: BunSQLClient;
  private readonly options: Required<MigroOptions>;

  constructor(options: MigroOptions) {
    let effectiveClient: BunSQLClient;

    if (options.databaseType === "postgresql") {
      if (options.pgConnectionString) {
        effectiveClient = new SQL(options.pgConnectionString);
      } else {
        effectiveClient = sql; // Use global 'sql' for PostgreSQL by default
      }
    } else if (options.databaseType === "sqlite") {
      if (options.sqliteDbPath) {
        effectiveClient = new SQL(new SQLiteDatabase(options.sqliteDbPath));
      } else {
        throw new Error("For SQLite, sqliteDbPath must be provided.");
      }
    } else {
      throw new Error(`Unsupported database type: ${options.databaseType}`);
    }

    this.client = effectiveClient;
    this.options = {
      ...options,
      tableName: options.tableName || "_migrations",
      sqliteDbPath: options.sqliteDbPath || "", // Default for Required type
      pgConnectionString: options.pgConnectionString || "", // Default for Required type
    };

    if (!this.options.migrationsFolder) {
      throw new Error("migrationsFolder is required");
    }
  }

  private async executeSql(query: string | SQLQuery): Promise<void> {
    if (typeof query === "string") {
      await this.client.unsafe(query);
    } else {
      await this.client`${query}`;
    }
  }

  private async getAppliedMigrations(): Promise<string[]> {
    try {
      const result = await this
        .client`SELECT name FROM ${sql.raw(this.options.tableName)} ORDER BY name`;

      if (
        Array.isArray(result) &&
        result.length > 0 &&
        typeof result[0] === "object" &&
        "name" in result[0]
      ) {
        return (result as { name: string }[]).map((row) => row.name);
      }
      if ((result as { rows?: { name: string }[] }).rows) {
        return (result as { rows: { name: string }[] }).rows.map(
          (row) => row.name
        );
      }
      return [];
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error.message.includes("no such table") ||
          error.message.includes("does not exist"))
      ) {
        return [];
      }
      throw error;
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const createTableSql =
      this.options.databaseType === "postgresql"
        ? sql`CREATE TABLE IF NOT EXISTS ${sql.raw(this.options.tableName)} (
             id SERIAL PRIMARY KEY,
             name VARCHAR(255) UNIQUE NOT NULL,
             applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           );`
        : sql`CREATE TABLE IF NOT EXISTS ${sql.raw(this.options.tableName)} (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             name TEXT UNIQUE NOT NULL,
             applied_at TEXT DEFAULT CURRENT_TIMESTAMP
           );`;
    await this.executeSql(createTableSql);
  }

  async up(): Promise<void> {
    await this.createMigrationsTable();
    const appliedMigrations = await this.getAppliedMigrations();

    const migrationFiles = await readdir(this.options.migrationsFolder);
    const pendingMigrations = migrationFiles
      .filter(
        (file) => file.endsWith(".sql") && !appliedMigrations.includes(file)
      )
      .sort();

    for (const migrationFile of pendingMigrations) {
      const migrationPath = join(this.options.migrationsFolder, migrationFile);
      const rawSql = await readFile(migrationPath, "utf-8");

      try {
        await this.client.begin(async (tx: typeof sql) => {
          await tx.unsafe(rawSql);
          await tx`INSERT INTO ${sql.raw(this.options.tableName)} (name) VALUES (${migrationFile});`;
        });
        console.log(`Applied migration: ${migrationFile}`);
      } catch (error: unknown) {
        console.error(`Failed to apply migration ${migrationFile}:`, error);
        throw error;
      }
    }
  }
}
