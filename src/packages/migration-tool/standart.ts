/**
 * Unified Database Schema Extractor
 *
 * Extracts table structure from SQLite/PostgreSQL and returns unified JSON schema
 * compatible with validation libraries (Zod, Valibot, Typebox).
 *
 * Type Mapping Examples:
 *
 * Zod:
 *   integer  → z.number().int()
 *   number   → z.number()
 *   string   → z.string()
 *   boolean  → z.boolean()
 *   date     → z.date() or z.string().datetime()
 *   json     → z.record(z.unknown())
 *   blob     → z.instanceof(Uint8Array)
 *   enum     → z.enum(['value1', 'value2', 'value3'])
 *
 * Valibot:
 *   integer  → v.number()
 *   number   → v.number()
 *   string   → v.string()
 *   boolean  → v.boolean()
 *   date     → v.date()
 *   json     → v.record(v.unknown())
 *   blob     → v.instance(Uint8Array)
 *   enum     → v.enum(['value1', 'value2', 'value3'])
 *
 * Typebox:
 *   integer  → Type.Integer()
 *   number   → Type.Number()
 *   string   → Type.String()
 *   boolean  → Type.Boolean()
 *   date     → Type.Date()
 *   json     → Type.Record(Type.String(), Type.Unknown())
 *   blob     → Type.Uint8Array()
 *   enum     → Type.Enum({ VALUE1: 'value1', VALUE2: 'value2' })
 *
 * Nullable handling:
 *   If nullable === true, wrap with:
 *     Zod:     .nullable() or .optional()
 *     Valibot: v.nullable() or v.optional()
 *     Typebox: Type.Union([Type.Null(), ...])
 *
 * Enum handling:
 *   PostgreSQL: Extracts enum values from pg_enum catalog
 *   SQLite: No native enum support, treated as string type
 *   Use enumValues array from ColumnInfo to generate enum validators
 */

/**
 * Unified Database Schema Extractor
 *
 * Extracts table structure from SQLite/PostgreSQL and returns unified JSON schema
 * compatible with validation libraries (Zod, Valibot, Typebox).
 *
 * Type Mapping Examples:
 *
 * Zod:
 *   integer  → z.number().int()
 *   number   → z.number()
 *   string   → z.string()
 *   boolean  → z.boolean()
 *   date     → z.date() or z.string().datetime()
 *   json     → z.record(z.unknown())
 *   blob     → z.instanceof(Uint8Array)
 *   enum     → z.enum(['value1', 'value2', 'value3'])
 *
 * Valibot:
 *   integer  → v.number()
 *   number   → v.number()
 *   string   → v.string()
 *   boolean  → v.boolean()
 *   date     → v.date()
 *   json     → v.record(v.unknown())
 *   blob     → v.instance(Uint8Array)
 *   enum     → v.enum(['value1', 'value2', 'value3'])
 *
 * Typebox:
 *   integer  → Type.Integer()
 *   number   → Type.Number()
 *   string   → Type.String()
 *   boolean  → Type.Boolean()
 *   date     → Type.Date()
 *   json     → Type.Record(Type.String(), Type.Unknown())
 *   blob     → Type.Uint8Array()
 *   enum     → Type.Enum({ VALUE1: 'value1', VALUE2: 'value2' })
 *
 * Nullable handling:
 *   If nullable === true, wrap with:
 *     Zod:     .nullable() or .optional()
 *     Valibot: v.nullable() or v.optional()
 *     Typebox: Type.Union([Type.Null(), ...])
 *
 * Enum handling:
 *   PostgreSQL: Extracts enum values from pg_enum catalog
 *   SQLite: No native enum support, treated as string type
 *   Use enumValues array from ColumnInfo to generate enum validators
 */

import Bun, { SQL } from "bun";
export type Adapter = "sqlite" | "postgres";

export type UnifiedType =
  | "integer"
  | "number"
  | "string"
  | "boolean"
  | "date"
  | "json"
  | "blob"
  | "enum";

export interface ColumnInfo {
  name: string;
  type: UnifiedType;
  nullable: boolean;
  default: string | null;
  primaryKey: boolean;
  position: number;
  enumValues?: string[];
}

export interface DatabaseSchema {
  [tableName: string]: ColumnInfo[];
}

function mapSqliteType(sqliteType: string): UnifiedType {
  const normalized = sqliteType.toUpperCase();

  if (normalized.includes("INT")) {
    return "integer";
  }

  if (
    normalized.includes("CHAR") ||
    normalized.includes("TEXT") ||
    normalized.includes("CLOB")
  ) {
    return "string";
  }

  if (
    normalized.includes("REAL") ||
    normalized.includes("FLOA") ||
    normalized.includes("DOUB") ||
    normalized.includes("NUMERIC") ||
    normalized.includes("DECIMAL")
  ) {
    return "number";
  }

  if (normalized.includes("BLOB")) {
    return "blob";
  }

  return "string";
}

function mapPostgresType(pgType: string): UnifiedType {
  const normalized = pgType.toLowerCase();

  if (normalized === "user-defined") {
    return "enum";
  }

  if (
    normalized === "integer" ||
    normalized === "smallint" ||
    normalized === "bigint" ||
    normalized === "serial" ||
    normalized === "bigserial"
  ) {
    return "integer";
  }

  if (
    normalized === "text" ||
    normalized === "varchar" ||
    normalized === "character varying" ||
    normalized === "char" ||
    normalized === "uuid"
  ) {
    return "string";
  }

  if (
    normalized === "numeric" ||
    normalized === "decimal" ||
    normalized === "real" ||
    normalized === "double precision" ||
    normalized === "money"
  ) {
    return "number";
  }

  if (normalized === "boolean") {
    return "boolean";
  }

  if (
    normalized === "timestamp" ||
    normalized === "timestamp with time zone" ||
    normalized === "timestamp without time zone" ||
    normalized === "date" ||
    normalized === "time" ||
    normalized === "time with time zone" ||
    normalized === "time without time zone" ||
    normalized === "interval"
  ) {
    return "date";
  }

  if (normalized === "json" || normalized === "jsonb") {
    return "json";
  }

  if (normalized === "bytea") {
    return "blob";
  }

  return "string";
}

interface SqliteTableInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

async function getSqliteSchema(sql: SQL): Promise<DatabaseSchema> {
  const schema: DatabaseSchema = {};

  const tables = await sql`
    SELECT name FROM sqlite_master 
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
  `;

  for (const table of tables as { name: string }[]) {
    const tableName = table.name;
    const columnsInfo = await sql.unsafe(`PRAGMA table_info(${tableName})`);

    schema[tableName] = (columnsInfo as SqliteTableInfo[]).map((col) => ({
      name: col.name,
      type: mapSqliteType(col.type),
      nullable: col.notnull === 0,
      default: col.dflt_value,
      primaryKey: col.pk === 1,
      position: col.cid + 1,
    }));
  }

  return schema;
}

interface PostgresColumn {
  table_name: string;
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
  column_default: string | null;
  ordinal_position: number;
}

interface PostgresPrimaryKey {
  table_name: string;
  column_name: string;
}

interface PostgresEnumValue {
  enum_name: string;
  enum_value: string;
}

async function getPostgresSchema(sql: SQL): Promise<DatabaseSchema> {
  const schema: DatabaseSchema = {};

  const columns = await sql`
    SELECT 
      table_name,
      column_name,
      data_type,
      udt_name,
      is_nullable,
      column_default,
      ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `;

  const pkColumns = await sql`
    SELECT 
      kcu.table_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
  `;

  const pkMap = new Set(
    (pkColumns as PostgresPrimaryKey[]).map(
      (pk) => `${pk.table_name}.${pk.column_name}`
    )
  );

  const enumTypes = await sql`
    SELECT 
      t.typname as enum_name,
      e.enumlabel as enum_value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    ORDER BY t.typname, e.enumsortorder
  `;

  const enumValuesMap = new Map<string, string[]>();
  for (const row of enumTypes as PostgresEnumValue[]) {
    if (!enumValuesMap.has(row.enum_name)) {
      enumValuesMap.set(row.enum_name, []);
    }
    const values = enumValuesMap.get(row.enum_name);
    if (values) {
      values.push(row.enum_value);
    }
  }

  for (const col of columns as PostgresColumn[]) {
    const tableName = col.table_name;
    if (!schema[tableName]) {
      schema[tableName] = [];
    }

    const type = mapPostgresType(col.data_type);
    const columnInfo: ColumnInfo = {
      name: col.column_name,
      type,
      nullable: col.is_nullable === "YES",
      default: col.column_default,
      primaryKey: pkMap.has(`${tableName}.${col.column_name}`),
      position: col.ordinal_position,
    };

    if (type === "enum" && col.udt_name && enumValuesMap.has(col.udt_name)) {
      columnInfo.enumValues = enumValuesMap.get(col.udt_name);
    }

    schema[tableName].push(columnInfo);
  }

  return schema;
}

export async function getJsonSchema(
  databaseUrl: string,
  adapter: Adapter = "sqlite"
): Promise<DatabaseSchema> {
  const sql = new SQL(databaseUrl, { adapter });

  try {
    if (adapter === "sqlite") {
      return await getSqliteSchema(sql);
    }

    return await getPostgresSchema(sql);
  } finally {
    await sql.close();
  }
}

if (import.meta.main) {
  try {
    const databaseSchema = await getJsonSchema("sqlite.test.db");

    await Bun.write(
      "sqlite.test.schema.json",
      JSON.stringify(databaseSchema, null, 2)
    );
  } catch (error) {
    throw new Error("Error fetching or saving schema", { cause: error });
  }
}
