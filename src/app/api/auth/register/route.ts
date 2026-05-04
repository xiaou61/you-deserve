import { NextResponse } from "next/server";

import { jsonError, normalizeName, readJson, validatePassword, validateUsername } from "@/lib/api-utils";
import { makeAccountId, attachUserCookie, createUserSession } from "@/lib/server-auth";
import { hashPassword } from "@/lib/password";
import { nowIso, query } from "@/lib/db";
import { loadStudyData } from "@/lib/study-data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request);
  const username = normalizeName(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  const nameError = validateUsername(username);
  const passwordError = validatePassword(password);

  if (nameError) {
    return jsonError(nameError);
  }

  if (passwordError) {
    return jsonError(passwordError);
  }

  const id = makeAccountId("usr");

  try {
    await query(
      "INSERT INTO users (id, username, password_hash, created_at, disabled) VALUES ($1, $2, $3, $4, false)",
      [id, username, hashPassword(password), nowIso()]
    );
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return jsonError("这个账号名已经被用了，换一个。");
    }

    throw error;
  }

  const session = await createUserSession(id);
  const data = await loadStudyData({ currentUserId: id });
  const response = NextResponse.json({ ok: true, message: `注册成功，${username}`, data });

  attachUserCookie(response, session.token);

  return response;
}
