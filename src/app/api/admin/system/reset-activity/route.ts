import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api-utils";
import { loadAdminDashboardData } from "@/lib/admin-data";
import { withTransaction } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function DELETE() {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

  await withTransaction(async (client) => {
    await client.query("DELETE FROM comments");
    await client.query("DELETE FROM question_user_activity");
    await client.query("DELETE FROM question_activity");
  });

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "全部学习行为数据已清空，账号仍保留。", ...payload });
}
