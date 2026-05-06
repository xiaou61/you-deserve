import { NextResponse } from "next/server";

import { jsonError, normalizeName, readJson } from "@/lib/api-utils";
import { hasQuestionSlug } from "@/lib/content";
import { nowIso, withTransaction } from "@/lib/db";
import { getCurrentUser } from "@/lib/server-auth";
import { loadStudyData } from "@/lib/study-data";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const columns = {
  like: "liked",
  favorite: "favorited",
  mastered: "mastered"
} as const;

export async function POST(request: Request, { params }: RouteContext) {
  const { slug } = await params;

  if (!hasQuestionSlug(slug)) {
    return jsonError("题目不存在。", 404);
  }

  const user = await getCurrentUser();

  if (!user) {
    return jsonError("先登录，再操作。", 401);
  }

  const body = await readJson(request);
  const action = normalizeName(body.action) as keyof typeof columns;
  const column = columns[action];

  if (!column) {
    return jsonError("未知操作。");
  }

  const timestamp = nowIso();

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO question_user_activity (slug, user_id, updated_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug, user_id) DO NOTHING`,
      [slug, user.id, timestamp]
    );
    await client.query(
      `UPDATE question_user_activity SET ${column} = NOT ${column}, updated_at = $3 WHERE slug = $1 AND user_id = $2`,
      [slug, user.id, timestamp]
    );
  });

  const data = await loadStudyData({ currentUserId: user.id });

  return NextResponse.json({ ok: true, message: "状态已保存到数据库。", data });
}
