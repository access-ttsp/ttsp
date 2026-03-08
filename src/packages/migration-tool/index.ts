import { file as bunFile, Glob, SQL } from "bun";

interface MigrateOptions {
  migrationsDir: string;
  connectionString: string;
  adapter: "sqlite" | "postgres";
}

interface MigrationFile {
  id: number;
  name: string;
  path: string;
}

const migrationRegex = /^(\d+)-(.+)\.sql$/;

function logForAi(message: string, payload?: Record<string, unknown>) {
  console.log("[log-for-ai]", message, JSON.stringify(payload));
}

function ensure(name: string, value: unknown) {
  if (value === undefined) {
    throw new Error(`Invalid value: ${name} = ${value}`);
  }
}

export async function migrate(options: MigrateOptions) {
  logForAi("Starting migration", { options });

  ensure("migrationsDir", options.migrationsDir);
  ensure("connectionString", options.connectionString);
  ensure("adapter", options.adapter);

  const _sql = new SQL(options.connectionString, { adapter: options.adapter });

  // 1. Create system table
  console.log("Ensuring system table _migrations exists...");
  await _sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("System table _migrations ready");

  // 2. Get applied migrations
  const appliedMigrations = await _sql`SELECT id FROM _migrations ORDER BY id`;
  const appliedIds = new Set(
    appliedMigrations.map((m: unknown) => (m as { id: number }).id)
  );

  // 3. Scan migration files
  const glob = new Glob("*.sql");
  const migrationFiles: MigrationFile[] = [];

  for await (const file of glob.scan(options.migrationsDir)) {
    const match = file.match(migrationRegex);

    if (!match) {
      throw new Error(
        `Invalid migration file name: ${file}. Expected format: NUMBER-name.sql`
      );
    }

    const id = Number.parseInt(match[1], 10);
    const name = match[2];

    migrationFiles.push({
      id,
      name,
      path: `${options.migrationsDir}/${file}`,
    });
  }

  logForAi("Found migration files", { migrationFiles });

  // 4. Sort and filter
  migrationFiles.sort((a, b) => a.id - b.id);
  const pendingMigrations = migrationFiles.filter((m) => !appliedIds.has(m.id));

  if (pendingMigrations.length === 0) {
    console.log("No pending migrations");
    await _sql.close();
    return;
  }

  console.log(`Found ${pendingMigrations.length} pending migrations`);

  // 5. Apply migrations
  for (const migration of pendingMigrations) {
    console.log(`Applying migration ${migration.id}: ${migration.name}`);

    await _sql.begin(async (tx) => {
      const migrationFile = bunFile(migration.path);
      const content = await migrationFile.text();

      // Execute migration content
      await tx.unsafe(content);

      // Record migration
      await tx`INSERT INTO _migrations (id) VALUES (${migration.id})`;
    });

    console.log(`✓ Applied migration ${migration.id}`);
  }

  console.log("All migrations applied successfully");
  await _sql.close();
}
