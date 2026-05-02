"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpenCheck, Code2, LogOut, UserRound } from "lucide-react";

import { useStudy } from "@/components/study-provider";

type AuthMode = "login" | "register";

export function SiteHeader() {
  const { currentUser, login, logout, ready, register } = useStudy();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const result = mode === "login" ? login(username, password) : register(username, password);
    setMessage(result.message);

    if (result.ok) {
      setUsername("");
      setPassword("");
      setOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-page/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-mint shadow-soft">
              <BookOpenCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="display-title block text-xl font-black leading-none text-ink">You Deserve</span>
              <span className="mt-1 block text-xs font-bold text-ink/48">双非上岸题库</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link className="nav-link" href="/#questions">
              题库
            </Link>
            <Link className="nav-link" href="/routes">
              路线
            </Link>
            <span className="nav-link text-ink/38">复习</span>
          </nav>

          <div className="flex items-center gap-2">
            <a
              aria-label="GitHub"
              className="icon-button hidden sm:grid"
              href="https://github.com/xiaou61/you-deserve"
              rel="noreferrer"
              target="_blank"
              title="代码仓库"
            >
              <Code2 className="h-4 w-4" />
            </a>

            {ready && currentUser ? (
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-white px-3 py-2 text-sm font-black text-ink/68 sm:inline-flex">
                  {currentUser}
                </span>
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-coral"
                  onClick={logout}
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  退出
                </button>
              </div>
            ) : (
              <button
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-coral"
                onClick={() => {
                  setMessage("");
                  setMode("login");
                  setOpen(true);
                }}
                type="button"
              >
                <UserRound className="h-4 w-4" />
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </header>

      {open ? (
        <div className="auth-overlay" onClick={() => setOpen(false)} role="presentation">
          <div
            className="auth-panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="登录注册"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">Account</p>
                <h2 className="mt-2 text-2xl font-black text-ink">{mode === "login" ? "欢迎回来" : "先注册一个本地账号"}</h2>
                <p className="mt-2 text-sm leading-6 text-ink/58">
                  这里是浏览器本地存储版账号，只为了让你的学习记录、笔记和评论能真的用起来。
                </p>
              </div>
              <button className="auth-close" onClick={() => setOpen(false)} type="button">
                关闭
              </button>
            </div>

            <div className="mt-5 flex gap-2 rounded-full bg-smoke p-1">
              <button
                className={`auth-tab ${mode === "login" ? "is-active" : ""}`}
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                type="button"
              >
                登录
              </button>
              <button
                className={`auth-tab ${mode === "register" ? "is-active" : ""}`}
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
                type="button"
              >
                注册
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-black text-ink/66">昵称</span>
                <input
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
                  className="auth-input"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="至少 4 位"
                  type="password"
                  value={password}
                />
              </label>
            </div>

            {message ? <p className="mt-4 rounded-2xl bg-smoke px-4 py-3 text-sm font-bold text-ink/70">{message}</p> : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button className="ghost-action" onClick={() => setOpen(false)} type="button">
                稍后再说
              </button>
              <button className="primary-action" onClick={handleSubmit} type="button">
                {mode === "login" ? "进入学习" : "注册并开始"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
