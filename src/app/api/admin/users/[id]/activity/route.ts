import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api-utils";
import { loadAdminDashboardData } from "@/lib/admin-data";
import { query, withTransaction } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: RouteContext) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

  const { id } = await params;
  const user = await query<{ id: string }>("SELECT id FROM users WHERE id = $1 LIMIT 1", [id]);

  if (!user.rowCount) {
    return jsonError("用户不存在。", 404);
  }

  await withTransaction(async (client) => {
    await client.query("DELETE FROM question_user_activity WHERE user_id = $1", [id]);
    await client.query("DELETE FROM comments WHERE user_id = $1", [id]);
  });

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "用户学习行为已清空，账号仍保留。", ...payload });
}
