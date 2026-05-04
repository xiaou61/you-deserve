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

async function activeAdminCount() {
  const result = await query<{ count: string }>("SELECT count(*) AS count FROM admins WHERE disabled = false");

  return Number(result.rows[0]?.count ?? 0);
}

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

  if (disabled === true && id === admin.id) {
    return jsonError("不能禁用当前正在登录的管理员。");
  }

  if (disabled === true && (await activeAdminCount()) <= 1) {
    return jsonError("至少要保留一个可用管理员。");
  }

  if ("username" in body) {
    const nameError = validateUsername(username);

    if (nameError) {
      return jsonError(nameError);
    }

    try {
      await query("UPDATE admins SET username = $1 WHERE id = $2", [username, id]);
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "23505") {
        return jsonError("这个管理员账号已经存在。");
      }

      throw error;
    }
  }

  if (password) {
    const passwordError = validatePassword(password);

    if (passwordError) {
      return jsonError(passwordError);
    }

    await query("UPDATE admins SET password_hash = $1 WHERE id = $2", [hashPassword(password), id]);
  }

  if (disabled !== null) {
    await query("UPDATE admins SET disabled = $1 WHERE id = $2", [disabled, id]);
    await query("DELETE FROM admin_sessions WHERE admin_id = $1", [id]);
  }

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "管理员资料已更新。", ...payload });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

  const { id } = await params;

  if (id === admin.id) {
    return jsonError("不能删除当前正在登录的管理员。");
  }

  if ((await activeAdminCount()) <= 1) {
    return jsonError("至少要保留一个可用管理员。");
  }

  await query("DELETE FROM admins WHERE id = $1", [id]);

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "管理员账号已删除。", ...payload });
}
