import { NextResponse } from "next/server";

import { jsonError, normalizeName, readJson, validatePassword, validateUsername } from "@/lib/api-utils";
import { loadAdminDashboardData } from "@/lib/admin-data";
import { query } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { attachAdminCookie, createAdminSession } from "@/lib/server-auth";

export const runtime = "nodejs";

type AdminLoginRow = {
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
    return jsonError("管理员账号或密码不对。", 401);
  }

  const result = await query<AdminLoginRow>(
    "SELECT id, username, password_hash, disabled FROM admins WHERE lower(username) = lower($1) LIMIT 1",
    [username]
  );
  const admin = result.rows[0];

  if (!admin || admin.disabled || !verifyPassword(password, admin.password_hash)) {
    return jsonError("管理员账号或密码不对。", 401);
  }

  const session = await createAdminSession(admin.id);
  const payload = await loadAdminDashboardData();
  const response = NextResponse.json({
    ok: true,
    message: `管理员 ${admin.username} 已登录。`,
    admin: {
      id: admin.id,
      username: admin.username
    },
    ...payload
  });

  attachAdminCookie(response, session.token);

  return response;
}
