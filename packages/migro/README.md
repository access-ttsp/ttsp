# Migro - A Simple SQL Migration Tool

Migro is a lightweight, forward-only SQL migration tool designed for both PostgreSQL and SQLite, leveraging Bun's native SQL capabilities.

## Features

-   **Database Agnostic**: Supports PostgreSQL and SQLite using Bun's native `sql` module.
-   **Forward-only Migrations**: Designed for simple schema evolution, no rollbacks.
-   **Simple API**: Easy to integrate into your existing projects.

## Installation

```bash
bun add migro
```

## Usage

### 1. Define Your Migrations

Create migration files in a designated directory (e.g., `migrations/`). Each migration file should contain the SQL for that migration.

Example: `migrations/001_create_users_table.sql`

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);
```

### 2. Run Migrations

Use the `Migro` class to apply your migrations.

```typescript
import { Migro } from 'migro';
import path from 'node:path';

async function main() {
    // For PostgreSQL (using global 'sql' client)
    const pgMigro = new Migro({
        migrationsFolder: path.join(import.meta.dir, 'migrations'),
        databaseType: 'postgresql',
        pgConnectionString: 'postgres://user:password@host:port/database', // Optional, defaults to global sql
    });
    await pgMigro.up();
    console.log('PostgreSQL migrations applied!');

    // For SQLite (using a dedicated SQLite database file)
    const sqliteMigro = new Migro({
        migrationsFolder: path.join(import.meta.dir, 'migrations'),
        databaseType: 'sqlite',
        sqliteDbPath: 'mydb.sqlite',
    });
    await sqliteMigro.up();
    console.log('SQLite migrations applied!');
}

main().catch(console.error);
```

## API

### `new Migro(options)`

Creates a new `Migro` instance.

-   `options`:
    -   `migrationsFolder`: (string, **required**) The absolute path to the directory containing your migration SQL files.
    -   `databaseType`: (string, **required**) The type of database. Must be `'postgresql'` or `'sqlite'`.
    -   `tableName`: (string, optional) The name of the table to store migration history. Defaults to `'_migrations'`.
    -   `sqliteDbPath`: (string, **required for SQLite**) The path to the SQLite database file.
    -   `pgConnectionString`: (string, optional for PostgreSQL) The connection string for PostgreSQL. If not provided, the global `sql` client will be used.

### `migro.up()`

Applies all pending migrations.

## Migration File Naming Convention

Migration files should be named numerically and descriptively, e.g., `001_create_users_table.sql`, `002_add_posts_table.sql`. The `Migro` tool will apply them in alphanumeric order.

## License

MIT