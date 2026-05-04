import { NextResponse } from "next/server";

import { jsonError, normalizeName, readJson, validatePassword, validateUsername } from "@/lib/api-utils";
import { query } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { loadStudyData } from "@/lib/study-data";
import { attachUserCookie, createUserSession } from "@/lib/server-auth";

export const runtime = "nodejs";

type UserLoginRow = {
  id: string;
  username: string;
  password_hash: string;
  disabled: boolean;
};

export async function POST(request: Request) {
  const body = await readJson(request);
  const username = normalizeName(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  const nameError = validateUsername(username);
  const passwordError = validatePassword(password);

  if (nameError || passwordError) {
    return jsonError("账号或密码不对，再看一眼。", 401);
  }

  const result = await query<UserLoginRow>(
    "SELECT id, username, password_hash, disabled FROM users WHERE lower(username) = lower($1) LIMIT 1",
    [username]
  );
  const user = result.rows[0];

  if (!user || user.disabled || !verifyPassword(password, user.password_hash)) {
    return jsonError("账号或密码不对，再看一眼。", 401);
  }

  const session = await createUserSession(user.id);
  const data = await loadStudyData({ currentUserId: user.id });
  const response = NextResponse.json({ ok: true, message: `欢迎回来，${user.username}`, data });

  attachUserCookie(response, session.token);

  return response;
}
