import Link from "next/link";
import { BookOpenCheck, Code2, UserRound } from "lucide-react";

export function SiteHeader() {
  return (
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
            href="https://github.com"
            rel="noreferrer"
            target="_blank"
            title="代码仓库"
          >
            <Code2 className="h-4 w-4" />
          </a>
          <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-coral">
            <UserRound className="h-4 w-4" />
            登录
          </button>
        </div>
      </div>
    </header>
  );
}
