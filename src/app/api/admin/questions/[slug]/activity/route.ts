import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api-utils";
import { loadAdminDashboardData } from "@/lib/admin-data";
import { hasQuestionSlug } from "@/lib/content";
import { withTransaction } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function DELETE(_request: Request, { params }: RouteContext) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

  const { slug } = await params;

  if (!hasQuestionSlug(slug)) {
    return jsonError("题目不存在。", 404);
  }

  await withTransaction(async (client) => {
    await client.query("DELETE FROM comments WHERE slug = $1", [slug]);
    await client.query("DELETE FROM question_user_activity WHERE slug = $1", [slug]);
    await client.query("DELETE FROM question_activity WHERE slug = $1", [slug]);
  });

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "题目互动数据已清空。", ...payload });
}
