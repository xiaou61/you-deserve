import { NextResponse } from "next/server";

import { jsonError, normalizeName, readJson, validatePassword, validateUsername } from "@/lib/api-utils";
import { loadAdminDashboardData } from "@/lib/admin-data";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { requireAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

  const { id } = await params;
  const body = await readJson(request);
  const username = "username" in body ? normalizeName(body.username) : "";
  const password = typeof body.password === "string" ? body.password : "";
  const disabled = typeof body.disabled === "boolean" ? body.disabled : null;

  if ("username" in body) {
    const nameError = validateUsername(username);

    if (nameError) {
      return jsonError(nameError);
    }

    try {
      await query("UPDATE users SET username = $1 WHERE id = $2", [username, id]);
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "23505") {
        return jsonError("这个用户账号已经存在。");
      }

      throw error;
    }
  }

  if (password) {
    const passwordError = validatePassword(password);

    if (passwordError) {
      return jsonError(passwordError);
    }

    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [hashPassword(password), id]);
  }

  if (disabled !== null) {
    await query("UPDATE users SET disabled = $1 WHERE id = $2", [disabled, id]);
    await query("DELETE FROM user_sessions WHERE user_id = $1", [id]);
  }

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "用户资料已更新。", ...payload });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

  const { id } = await params;

  await query("DELETE FROM users WHERE id = $1", [id]);

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "用户账号及其行为数据已删除。", ...payload });
}
