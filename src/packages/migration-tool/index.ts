import { SQL } from "bun";

interface MigrateOptions {
  migrationsDir: string;
  connectionString: string;
}

export async function migrate(options: MigrateOptions) {
  await 1;
  // _sql``, not _sql.exec etc
  const _sql = new SQL(options.connectionString);
}
