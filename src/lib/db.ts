import { randomUUID } from "node:crypto";

import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

import { hashPassword } from "@/lib/password";

const fallbackDatabaseUrl = "postgresql://you_deserve:you_deserve_dev@localhost:55432/you_deserve";

type DbGlobal = typeof globalThis & {
  ydPool?: Pool;
  ydInitPromise?: Promise<void>;
};

const dbGlobal = globalThis as DbGlobal;

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}

function getPool() {
  if (!dbGlobal.ydPool) {
    const configuredUrl =
      process.env.YD_DATABASE_URL ??
      (process.env.DATABASE_URL?.startsWith("postgres://") || process.env.DATABASE_URL?.startsWith("postgresql://")
        ? process.env.DATABASE_URL
        : undefined) ??
      fallbackDatabaseUrl;
    const databaseUrl = new URL(configuredUrl);

    dbGlobal.ydPool = new Pool({
      database: decodeURIComponent(databaseUrl.pathname.replace(/^\//, "")),
      host: databaseUrl.hostname,
      max: 10,
      password: decodeURIComponent(databaseUrl.password),
      port: Number(databaseUrl.port || 5432),
      user: decodeURIComponent(databaseUrl.username)
    });
  }

  return dbGlobal.ydPool;
}

async function seedDefaultAdmin(pool: Pool) {
  const username = process.env.YD_ADMIN_USERNAME?.trim();
  const password = process.env.YD_ADMIN_PASSWORD;

  if (!username || !password) {
    return;
  }

  const existing = await pool.query<{ id: string }>("SELECT id FROM admins WHERE lower(username) = lower($1)", [
    username
  ]);

  if (existing.rowCount) {
    return;
  }

  await pool.query(
    "INSERT INTO admins (id, username, password_hash, created_at, disabled) VALUES ($1, $2, $3, $4, false)",
    [createId("adm"), username, hashPassword(password), nowIso()]
  );
}

async function initDatabase() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      disabled BOOLEAN NOT NULL DEFAULT false
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (lower(username));

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      disabled BOOLEAN NOT NULL DEFAULT false
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_username_lower ON admins (lower(username));

    CREATE TABLE IF NOT EXISTS user_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token_hash TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);

    CREATE TABLE IF NOT EXISTS question_activity (
      slug TEXT PRIMARY KEY,
      views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0)
    );

    CREATE TABLE IF NOT EXISTS question_user_activity (
      slug TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      viewed_count INTEGER NOT NULL DEFAULT 0 CHECK (viewed_count >= 0),
      last_viewed_at TIMESTAMPTZ,
      liked BOOLEAN NOT NULL DEFAULT false,
      favorited BOOLEAN NOT NULL DEFAULT false,
      mastered BOOLEAN NOT NULL DEFAULT false,
      note TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL,
      PRIMARY KEY (slug, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_question_user_activity_user ON question_user_activity(user_id);
    CREATE INDEX IF NOT EXISTS idx_question_user_activity_slug ON question_user_activity(slug);

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug);
    CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
  `);

  await seedDefaultAdmin(pool);
}

export async function ensureDb() {
  if (!dbGlobal.ydInitPromise) {
    dbGlobal.ydInitPromise = initDatabase();
  }

  try {
    await dbGlobal.ydInitPromise;
  } catch (error) {
    dbGlobal.ydInitPromise = undefined;
    throw error;
  }
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  await ensureDb();
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(run: (client: PoolClient) => Promise<T>) {
  await ensureDb();
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
