import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api-utils";
import { loadAdminDashboardData } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return jsonError("需要管理员登录。", 401);
  }

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, admin, ...payload });
}
