"use client";

import Link from "next/link";
import { BookOpenCheck, Code2, LogOut, UserRound } from "lucide-react";

import { useStudy } from "@/components/study-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteHeader() {
  const { currentUser, logout, ready } = useStudy();

  return (
    <header className="sticky top-0 z-[80] isolate border-b border-white/50 bg-white/55 backdrop-blur-2xl">
      <div className="relative z-[1] mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex shrink-0 items-center gap-3" href="/">
          <span className="grid h-11 w-11 place-items-center rounded-[1.35rem] border border-white/70 bg-white/70 text-teal shadow-soft backdrop-blur-xl">
            <BookOpenCheck className="h-5 w-5" />
          </span>
          <span>
            <span className="display-title block text-[1.1rem] font-semibold leading-none tracking-[-0.02em] text-ink">You Deserve</span>
            <span className="mt-1 block text-[0.72rem] font-medium tracking-[0.04em] text-ink/46">Java 后端上岸题库</span>
          </span>
        </Link>

        <nav className="relative z-[1] hidden items-center gap-1 rounded-full border border-white/65 bg-white/55 p-1 shadow-[0_10px_30px_rgba(17,17,19,0.06)] backdrop-blur-xl md:flex">
          <Link className="nav-link" href="/#questions">
            题库
          </Link>
          <Link className="nav-link" href="/routes">
            路线
          </Link>
          <Link className="nav-link" href="/review">
            复习模式
          </Link>
          <Link className="nav-link" href="/me">
            个人中心
          </Link>
          <Link className="nav-link" href="/admin">
            内容后台
          </Link>
        </nav>

        <div className="relative z-[1] flex items-center gap-2">
          <ThemeSwitcher />

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
              <Link
                className="hidden rounded-full border border-white/65 bg-white/60 px-3.5 py-2 text-sm font-semibold text-ink/72 backdrop-blur-xl transition hover:bg-white/80 hover:text-ink sm:inline-flex"
                href="/me"
              >
                {currentUser}
              </Link>
              <button
                className="primary-action px-4 py-2 text-sm font-semibold"
                onClick={() => void logout()}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                退出
              </button>
            </div>
          ) : (
            <Link className="primary-action px-4 py-2 text-sm font-semibold" href="/auth">
              <UserRound className="h-4 w-4" />
              登录 / 注册
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
