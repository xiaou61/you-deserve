import { NextResponse } from "next/server";

import { clearAdminCookie, destroyAdminSession } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST() {
  await destroyAdminSession();

  const response = NextResponse.json({ ok: true, message: "已退出管理员后台。" });

  clearAdminCookie(response);

  return response;
}
