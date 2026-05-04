import { NextResponse } from "next/server";

import { jsonError, normalizeName, readJson } from "@/lib/api-utils";
import { loadAdminDashboardData } from "@/lib/admin-data";
import { nowIso, query } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

  const body = await readJson(request);
  const slug = normalizeName(body.slug);
  const username = normalizeName(body.username);

  if (!slug || !username) {
    return jsonError("缺少笔记定位信息。");
  }

  await query(
    `UPDATE question_user_activity
     SET note = '', updated_at = $3
     WHERE slug = $1
       AND user_id = (SELECT id FROM users WHERE lower(username) = lower($2) LIMIT 1)`,
    [slug, username, nowIso()]
  );

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "笔记已删除。", ...payload });
}
