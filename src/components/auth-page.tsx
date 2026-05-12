"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, DatabaseZap, ShieldCheck, UserRound } from "lucide-react";

import { useStudy } from "@/components/study-provider";

type AuthMode = "login" | "register";

function readMode(value: string | null): AuthMode {
  return value === "register" ? "register" : "login";
}

export function AuthPage() {
  const { currentUser, login, ready, register } = useStudy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() => readMode(searchParams.get("mode")));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirect = useMemo(() => searchParams.get("redirect") || "/me", [searchParams]);

  useEffect(() => {
    setMode(readMode(searchParams.get("mode")));
  }, [searchParams]);

  const syncMode = (nextMode: AuthMode) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("mode", nextMode);
    router.replace(`/auth?${next.toString()}`, { scroll: false });
    setMode(nextMode);
    setMessage("");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = mode === "login" ? await login(username, password) : await register(username, password);
    setSubmitting(false);
    setMessage(result.message);

    if (result.ok) {
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-12 pt-6 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pb-16 lg:pt-10">
      <section className="hero-panel overflow-hidden rounded-[2.2rem] p-6 sm:p-8 lg:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/68 px-3.5 py-1.5 text-sm font-semibold text-ink/76 backdrop-blur-xl">
          <UserRound className="h-4 w-4 text-teal" />
          学习账号入口
        </div>
        <h1 className="display-title mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-ink sm:text-5xl">
          用户端账号单独登录，别和后台混着用。
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-ink/66">
          这里保存的是你的浏览、收藏、掌握、笔记和评论。管理员后台还是单独入口，账号也不是同一套。
        </p>

        <div className="mt-8 grid gap-3">
          <div className="rounded-[1.4rem] border border-white/70 bg-white/72 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-coral" />
              <p className="text-sm font-black text-ink">没有默认用户账号</p>
            </div>
            <p className="mt-2 text-sm leading-7 text-ink/58">第一次来先注册一个学习账号。管理员的默认账号密码不能在这里登录。</p>
          </div>
          <div className="rounded-[1.4rem] border border-white/70 bg-white/72 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <DatabaseZap className="h-5 w-5 text-teal" />
              <p className="text-sm font-black text-ink">如果提示数据库连接失败</p>
            </div>
            <p className="mt-2 text-sm leading-7 text-ink/58">那不是账号密码错了，是本地 PostgreSQL 还没启动。数据库起来后，注册和登录才会真正可用。</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="ghost-action px-4 py-2 text-sm font-semibold" href="/">
            <ArrowLeft className="h-4 w-4" />
            先回首页
          </Link>
          <Link className="ghost-action px-4 py-2 text-sm font-semibold" href="/admin">
            管理员后台入口
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/72 p-6 shadow-soft backdrop-blur-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">Auth</p>
            <h2 className="mt-2 text-3xl font-black text-ink">{mode === "login" ? "欢迎回来" : "先注册一个学习账号"}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/58">
              {mode === "login"
                ? "继续你的学习轨迹，收藏、掌握和笔记都会跟着账号走。"
                : "账号名 2 到 24 位，密码 6 到 72 位。注册成功后会自动登录。"}
            </p>
          </div>
          {ready && currentUser ? (
            <Link className="ghost-action px-4 py-2 text-sm font-semibold" href={redirect}>
              已登录：{currentUser}
            </Link>
          ) : null}
        </div>

        <div className="mt-6 flex gap-2 rounded-full bg-smoke p-1">
          <button className={`auth-tab ${mode === "login" ? "is-active" : ""}`} onClick={() => syncMode("login")} type="button">
            登录
          </button>
          <button className={`auth-tab ${mode === "register" ? "is-active" : ""}`} onClick={() => syncMode("register")} type="button">
            注册
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-black text-ink/66">账号名</span>
            <input
              autoComplete="username"
              className="auth-input"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="比如：鼠鼠冲刺版"
              type="text"
              value={username}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-black text-ink/66">密码</span>
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="auth-input"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 6 位"
              type="password"
              value={password}
            />
          </label>
        </div>

        {message ? (
          <p className="mt-4 rounded-2xl bg-smoke px-4 py-3 text-sm font-bold leading-6 text-ink/70">{message}</p>
        ) : (
          <p className="mt-4 rounded-2xl bg-smoke px-4 py-3 text-sm font-bold leading-6 text-ink/56">
            {mode === "login"
              ? "如果你还没有学习账号，切到“注册”先创建一个。"
              : "注册的是用户端学习账号，不会自动获得后台权限。"}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link className="ghost-action justify-center" href="/">
            稍后再说
          </Link>
          <button className="primary-action justify-center" disabled={submitting} onClick={() => void handleSubmit()} type="button">
            {submitting ? "处理中..." : mode === "login" ? "登录并继续学习" : "注册并开始学习"}
          </button>
        </div>
      </section>
    </main>
  );
}
