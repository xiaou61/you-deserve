import { NextResponse } from "next/server";

import { jsonError, readJson } from "@/lib/api-utils";
import { loadAdminDashboardData } from "@/lib/admin-data";
import { query, withTransaction } from "@/lib/db";
import { requireAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

  const body = await readJson(request);
  const validSlugs = Array.isArray(body.validSlugs)
    ? body.validSlugs.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  await withTransaction(async (client) => {
    await client.query(
      `DELETE FROM question_user_activity
       WHERE viewed_count = 0
         AND liked = false
         AND favorited = false
         AND mastered = false
         AND btrim(note) = ''`
    );

    if (validSlugs.length > 0) {
      await client.query("DELETE FROM comments WHERE NOT (slug = ANY($1::text[]))", [validSlugs]);
      await client.query("DELETE FROM question_user_activity WHERE NOT (slug = ANY($1::text[]))", [validSlugs]);
      await client.query("DELETE FROM question_activity WHERE NOT (slug = ANY($1::text[]))", [validSlugs]);
    }
  });

  await query(
    `DELETE FROM question_activity qa
     WHERE qa.views = 0
       AND NOT EXISTS (SELECT 1 FROM question_user_activity ua WHERE ua.slug = qa.slug)
       AND NOT EXISTS (SELECT 1 FROM comments c WHERE c.slug = qa.slug)`
  );

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, message: "数据巡检修复完成。", ...payload });
}
