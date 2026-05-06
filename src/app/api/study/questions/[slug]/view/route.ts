import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api-utils";
import { hasQuestionSlug } from "@/lib/content";
import { nowIso, withTransaction } from "@/lib/db";
import { getCurrentUser } from "@/lib/server-auth";
import { loadStudyData } from "@/lib/study-data";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const { slug } = await params;

  if (!hasQuestionSlug(slug)) {
    return jsonError("题目不存在。", 404);
  }

  const user = await getCurrentUser();
  const timestamp = nowIso();

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO question_activity (slug, views)
       VALUES ($1, 1)
       ON CONFLICT (slug) DO UPDATE SET views = question_activity.views + 1`,
      [slug]
    );

    if (user) {
      await client.query(
        `INSERT INTO question_user_activity
          (slug, user_id, viewed_count, last_viewed_at, updated_at)
         VALUES ($1, $2, 1, $3, $3)
         ON CONFLICT (slug, user_id)
         DO UPDATE SET
           viewed_count = question_user_activity.viewed_count + 1,
           last_viewed_at = EXCLUDED.last_viewed_at,
           updated_at = EXCLUDED.updated_at`,
        [slug, user.id, timestamp]
      );
    }
  });

  const data = await loadStudyData({ currentUserId: user?.id ?? null });

  return NextResponse.json({ ok: true, message: "浏览已记录到数据库。", data });
}
