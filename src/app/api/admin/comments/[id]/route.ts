import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api-utils";
import { loadAdminDashboardData } from "@/lib/admin-data";
import { query } from "@/lib/db";
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

  const result = await query("DELETE FROM comments WHERE id = $1", [id]);

  if (!result.rowCount) {
    return jsonError("评论不存在。", 404);
  }

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "评论已删除。", ...payload });
}
