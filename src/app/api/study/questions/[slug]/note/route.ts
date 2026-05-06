import { NextResponse } from "next/server";

import { jsonError, readJson } from "@/lib/api-utils";
import { hasQuestionSlug } from "@/lib/content";
import { nowIso, query } from "@/lib/db";
import { getCurrentUser } from "@/lib/server-auth";
import { loadStudyData } from "@/lib/study-data";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const { slug } = await params;

  if (!hasQuestionSlug(slug)) {
    return jsonError("题目不存在。", 404);
  }

  const user = await getCurrentUser();

  if (!user) {
    return jsonError("先登录，再保存笔记。", 401);
  }

  const body = await readJson(request);
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 5000) : "";
  const timestamp = nowIso();

  await query(
    `INSERT INTO question_user_activity (slug, user_id, note, updated_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (slug, user_id)
     DO UPDATE SET note = EXCLUDED.note, updated_at = EXCLUDED.updated_at`,
    [slug, user.id, note, timestamp]
  );

  const data = await loadStudyData({ currentUserId: user.id });

  return NextResponse.json({ ok: true, message: "笔记已经保存到数据库。", data });
}
