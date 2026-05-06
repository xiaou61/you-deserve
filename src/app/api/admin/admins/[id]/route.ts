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

async function getAdminTarget(id: string) {
  const result = await query<{ id: string; disabled: boolean }>(
    "SELECT id, disabled FROM admins WHERE id = $1 LIMIT 1",
    [id]
  );

  return result.rows[0] ?? null;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

  const { id } = await params;
  const body = await readJson(request);
  const hasUsername = "username" in body;
  const hasPassword = "password" in body;
  const hasDisabled = "disabled" in body;
  const username = hasUsername ? normalizeName(body.username) : "";
  const password = hasPassword && typeof body.password === "string" ? body.password : "";
  const disabled = hasDisabled && typeof body.disabled === "boolean" ? body.disabled : null;

  if (!hasUsername && !hasPassword && !hasDisabled) {
    return jsonError("没有可更新的管理员字段。");
  }

  if (hasDisabled && disabled === null) {
    return jsonError("管理员状态必须是布尔值。");
  }

  const target = await getAdminTarget(id);

  if (!target) {
    return jsonError("管理员不存在。", 404);
  }

  if (hasDisabled && disabled === true && id === admin.id) {
    return jsonError("不能禁用当前正在登录的管理员。");
  }

  if (hasDisabled && disabled === true && !target.disabled && (await activeAdminCount()) <= 1) {
    return jsonError("至少要保留一个可用管理员。");
  }

  if (hasUsername) {
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

  if (hasPassword) {
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

  const target = await getAdminTarget(id);

  if (!target) {
    return jsonError("管理员不存在。", 404);
  }

  if (id === admin.id) {
    return jsonError("不能删除当前正在登录的管理员。");
  }

  if (!target.disabled && (await activeAdminCount()) <= 1) {
    return jsonError("至少要保留一个可用管理员。");
  }

  const result = await query("DELETE FROM admins WHERE id = $1", [id]);

  if (!result.rowCount) {
    return jsonError("管理员不存在。", 404);
  }

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "管理员账号已删除。", ...payload });
}
