import { migrate } from ".";

await migrate({
  migrationsDir: "test-migrations",
  connectionString: "./sqlite.test.db",
  adapter: "sqlite",
});
