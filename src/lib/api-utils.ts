import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export function normalizeName(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function readJson(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function validateUsername(username: string) {
  if (username.length < 2 || username.length > 24) {
    return "账号名需要 2 到 24 个字符。";
  }

  if (!/^[\u4e00-\u9fa5A-Za-z0-9_-]+$/.test(username)) {
    return "账号名只能包含中文、字母、数字、下划线和短横线。";
  }

  return "";
}

export function validatePassword(password: string) {
  if (password.length < 6 || password.length > 72) {
    return "密码需要 6 到 72 位。";
  }

  return "";
}
