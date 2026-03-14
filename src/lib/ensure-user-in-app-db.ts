import { sql } from "bun";

export async function ensureUserInAppDb(userId: string): Promise<void> {
  try {
    await sql`INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO NOTHING`;
  } catch (err) {
    throw new Error("Failed to sync user to app database", { cause: err });
  }
}
