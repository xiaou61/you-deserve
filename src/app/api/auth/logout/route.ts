import { NextResponse } from "next/server";

import { clearUserCookie, destroyUserSession } from "@/lib/server-auth";
import { loadStudyData } from "@/lib/study-data";

export const runtime = "nodejs";

export async function POST() {
  await destroyUserSession();

  const data = await loadStudyData();
  const response = NextResponse.json({ ok: true, message: "已退出用户账号。", data });

  clearUserCookie(response);

  return response;
}
