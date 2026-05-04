import { NextResponse } from "next/server";

import { loadStudyData } from "@/lib/study-data";
import { getCurrentUser } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  const data = await loadStudyData({ currentUserId: user?.id ?? null });

  return NextResponse.json({ ok: true, data, user });
}
