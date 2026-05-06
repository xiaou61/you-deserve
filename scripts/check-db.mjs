import fs from "node:fs";
import path from "node:path";

import { Pool } from "pg";

const root = process.cwd();
const requiredTables = [
  "users",
  "admins",
  "user_sessions",
  "admin_sessions",
  "question_activity",
  "question_user_activity",
  "comments"
];

function loadEnvFile(fileName) {
  const filePath = path.join(root, fileName);

  if (!fs.existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");

        return [key, value];
      })
  );
}

function getDatabaseUrl() {
  const localEnv = loadEnvFile(".env.local");
  const exampleEnv = loadEnvFile(".env.example");
  const processDatabaseUrl =
    process.env.DATABASE_URL?.startsWith("postgres://") || process.env.DATABASE_URL?.startsWith("postgresql://")
      ? process.env.DATABASE_URL
      : undefined;
  const localDatabaseUrl =
    localEnv.DATABASE_URL?.startsWith("postgres://") || localEnv.DATABASE_URL?.startsWith("postgresql://")
      ? localEnv.DATABASE_URL
      : undefined;

  return (
    process.env.YD_DATABASE_URL ??
    processDatabaseUrl ??
    localEnv.YD_DATABASE_URL ??
    localDatabaseUrl ??
    exampleEnv.YD_DATABASE_URL ??
    "postgresql://you_deserve:you_deserve_dev@localhost:55432/you_deserve"
  );
}

function poolConfig(databaseUrl) {
  const parsed = new URL(databaseUrl);

  return {
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
    host: parsed.hostname,
    password: decodeURIComponent(parsed.password),
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username)
  };
}

function formatError(error) {
  if (error instanceof AggregateError) {
    return error.errors.map(formatError).join("\n");
  }

  if (error instanceof Error) {
    const parts = [error.message, error.code, error.address, error.port].filter(Boolean);

    return parts.join(" ");
  }

  return String(error);
}

const databaseUrl = getDatabaseUrl();
const config = poolConfig(databaseUrl);
const pool = new Pool({
  ...config,
  connectionTimeoutMillis: 3000,
  max: 1
});

try {
  await pool.query("SELECT 1");

  const tableResult = await pool.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])`,
    [requiredTables]
  );
  const existing = new Set(tableResult.rows.map((row) => row.table_name));
  const missing = requiredTables.filter((table) => !existing.has(table));

  if (missing.length > 0) {
    console.error(`Database connected, but missing tables: ${missing.join(", ")}`);
    console.error("Start the app once to run automatic schema initialization, then retry this check.");
    process.exit(1);
  }

  console.log(`Database OK: ${config.user}@${config.host}:${config.port}/${config.database}`);
} catch (error) {
  console.error(`Database check failed for ${config.user}@${config.host}:${config.port}/${config.database}`);
  console.error(formatError(error));
  process.exit(1);
} finally {
  await pool.end();
}
