import { NextResponse } from "next/server";

import { jsonError, readJson } from "@/lib/api-utils";
import { createId, nowIso, query } from "@/lib/db";
import { getCurrentUser } from "@/lib/server-auth";
import { loadStudyData } from "@/lib/study-data";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return jsonError("先登录，再发表评论。", 401);
  }

  const { slug } = await params;
  const body = await readJson(request);
  const content = typeof body.content === "string" ? body.content.trim().slice(0, 1000) : "";

  if (content.length < 2) {
    return jsonError("评论太短了，至少写两三个字。");
  }

  await query("INSERT INTO comments (id, slug, user_id, content, created_at) VALUES ($1, $2, $3, $4, $5)", [
    createId("cmt"),
    slug,
    user.id,
    content,
    nowIso()
  ]);

  const data = await loadStudyData({ currentUserId: user.id });

  return NextResponse.json({ ok: true, message: "评论已保存到数据库。", data });
}
