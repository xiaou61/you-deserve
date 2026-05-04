import type { QueryResultRow } from "pg";

import { query } from "@/lib/db";
import { loadStudyData } from "@/lib/study-data";

export type AdminAccount = {
  id: string;
  username: string;
  createdAt: string;
  disabled: boolean;
};

type AdminRow = QueryResultRow & {
  id: string;
  username: string;
  created_at: string | Date;
  disabled: boolean;
};

function toIso(value: string | Date) {
  return new Date(value).toISOString();
}

export async function loadAdminAccounts() {
  const result = await query<AdminRow>("SELECT id, username, created_at, disabled FROM admins ORDER BY created_at DESC");

  return result.rows.map((row) => ({
    id: row.id,
    username: row.username,
    createdAt: toIso(row.created_at),
    disabled: row.disabled
  }));
}

export async function loadAdminDashboardData() {
  const [data, admins] = await Promise.all([loadStudyData({ includeAllUsers: true }), loadAdminAccounts()]);

  return {
    data,
    admins
  };
}
