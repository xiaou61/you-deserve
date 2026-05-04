import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";
import { type NextResponse } from "next/server";

import { createId, nowIso, query } from "@/lib/db";

export const USER_SESSION_COOKIE = "yd_user_session";
export const ADMIN_SESSION_COOKIE = "yd_admin_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionAccount = {
  id: string;
  username: string;
  createdAt: string;
  disabled: boolean;
};

type AccountRow = {
  id: string;
  username: string;
  created_at: string | Date;
  disabled: boolean;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeAccount(row: AccountRow): SessionAccount {
  return {
    id: row.id,
    username: row.username,
    createdAt: new Date(row.created_at).toISOString(),
    disabled: row.disabled
  };
}

function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  };
}

export async function createUserSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  await query(
    "INSERT INTO user_sessions (token_hash, user_id, created_at, expires_at) VALUES ($1, $2, $3, $4)",
    [hashToken(token), userId, nowIso(), expiresAt]
  );

  return { token, expiresAt };
}

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();

  await query(
    "INSERT INTO admin_sessions (token_hash, admin_id, created_at, expires_at) VALUES ($1, $2, $3, $4)",
    [hashToken(token), adminId, nowIso(), expiresAt]
  );

  return { token, expiresAt };
}

export function attachUserCookie(response: NextResponse, token: string) {
  response.cookies.set(USER_SESSION_COOKIE, token, sessionCookieOptions());
}

export function attachAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, sessionCookieOptions());
}

export function clearUserCookie(response: NextResponse) {
  response.cookies.set(USER_SESSION_COOKIE, "", sessionCookieOptions(0));
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", sessionCookieOptions(0));
}

export async function destroyUserSession() {
  const store = await cookies();
  const token = store.get(USER_SESSION_COOKIE)?.value;

  if (!token) {
    return;
  }

  await query("DELETE FROM user_sessions WHERE token_hash = $1", [hashToken(token)]);
}

export async function destroyAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return;
  }

  await query("DELETE FROM admin_sessions WHERE token_hash = $1", [hashToken(token)]);
}

export async function getCurrentUser(): Promise<SessionAccount | null> {
  const store = await cookies();
  const token = store.get(USER_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const result = await query<AccountRow>(
    `SELECT u.id, u.username, u.created_at, u.disabled
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1
       AND s.expires_at > NOW()
       AND u.disabled = false
     LIMIT 1`,
    [hashToken(token)]
  );

  return result.rows[0] ? normalizeAccount(result.rows[0]) : null;
}

export async function getCurrentAdmin(): Promise<SessionAccount | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const result = await query<AccountRow>(
    `SELECT a.id, a.username, a.created_at, a.disabled
     FROM admin_sessions s
     JOIN admins a ON a.id = s.admin_id
     WHERE s.token_hash = $1
       AND s.expires_at > NOW()
       AND a.disabled = false
     LIMIT 1`,
    [hashToken(token)]
  );

  return result.rows[0] ? normalizeAccount(result.rows[0]) : null;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return null;
  }

  return admin;
}

export function makeAccountId(prefix: "usr" | "adm") {
  return createId(prefix);
}
