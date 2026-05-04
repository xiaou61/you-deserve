import { NextResponse } from "next/server";

import { jsonError, normalizeName, readJson, validatePassword, validateUsername } from "@/lib/api-utils";
import { loadAdminDashboardData } from "@/lib/admin-data";
import { nowIso, query } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { makeAccountId, requireAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

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

  try {
    await query(
      "INSERT INTO admins (id, username, password_hash, created_at, disabled) VALUES ($1, $2, $3, $4, false)",
      [makeAccountId("adm"), username, hashPassword(password), nowIso()]
    );
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return jsonError("这个管理员账号已经存在。");
    }

    throw error;
  }

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "管理员账号已创建。", ...payload });
}
