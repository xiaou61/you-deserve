import { NextResponse } from "next/server";

import { loadAdminDashboardData } from "@/lib/admin-data";
import { getCurrentAdmin } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ ok: true, admin: null });
  }

  const payload = await loadAdminDashboardData();

  return NextResponse.json({ ok: true, admin, ...payload });
}
