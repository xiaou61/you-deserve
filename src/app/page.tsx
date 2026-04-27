import Link from "next/link";
import { ArrowUpRight, BookMarked, Flame, GraduationCap, Layers3 } from "lucide-react";

import { QuestionExplorer } from "@/components/question-explorer";
import { getCategories, getQuestionMetas, getRoutes } from "@/lib/content";

export default function Home() {
  const questions = getQuestionMetas();
  const categories = getCategories();
  const routes = getRoutes();
  const featured = questions.slice(0, 3);

  return (
    <main>
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-8 pt-6 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-10 lg:pt-10">
        <div className="hero-panel min-h-[460px] overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-sm font-bold text-ink">
            <Flame className="h-4 w-4 text-coral" />
            Java 后端上岸路线 · 内容持续打磨
          </div>
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-teal">
              You Deserve
            </p>
            <h1 className="display-title text-5xl font-black leading-[1.05] text-ink sm:text-6xl lg:text-7xl">
              你值得一个更清楚的上岸题库。
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72">
              不堆概念，不写天书。每道题都按“一句话结论、通俗解释、面试回答、追问、易错点”组织，先让你听懂，再让你答稳。
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="metric-tile">
              <span>{questions.length}</span>
              <p>已整理题目</p>
            </div>
            <div className="metric-tile">
              <span>{categories.length}</span>
              <p>核心专题</p>
            </div>
            <div className="metric-tile">
              <span>0</span>
              <p>运行时 AI 调用</p>
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[1.6rem] border border-ink/10 bg-ink p-6 text-white shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-mint">今日路线</p>
                <h2 className="mt-3 text-3xl font-black">先拿下面试高频题</h2>
              </div>
              <GraduationCap className="h-9 w-9 text-amber" />
            </div>
            <div className="mt-8 grid gap-3">
              {featured.map((question, index) => (
                <Link
                  className="group flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 transition hover:bg-white/14"
                  href={`/questions/${question.slug}`}
                  key={question.slug}
                >
                  <div>
                    <p className="text-xs font-black text-white/45">0{index + 1}</p>
                    <p className="mt-1 font-bold leading-snug">{question.title}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/45 transition group-hover:text-amber" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-ink/10 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mint text-ink">
                <BookMarked className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink/55">学习闭环</p>
                <h2 className="text-xl font-black text-ink">收藏、掌握、复习已预留</h2>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-2xl bg-smoke px-2 py-4">
                <p className="text-2xl font-black text-coral">{questions.length}</p>
                <p className="mt-1 text-ink/55">待刷</p>
              </div>
              <div className="rounded-2xl bg-smoke px-2 py-4">
                <p className="text-2xl font-black text-teal">0</p>
                <p className="mt-1 text-ink/55">已掌握</p>
              </div>
              <div className="rounded-2xl bg-smoke px-2 py-4">
                <p className="text-2xl font-black text-amber-strong">0%</p>
                <p className="mt-1 text-ink/55">进度</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-ink/10 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <Layers3 className="h-5 w-5 text-coral" />
              <h2 className="text-lg font-black text-ink">路线覆盖</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {routes.map((route) => (
                <Link className="rounded-full bg-smoke px-3 py-1.5 text-sm font-bold text-ink/70 transition hover:bg-ink hover:text-white" href="/routes" key={route}>
                  {route}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" id="questions">
        <QuestionExplorer categories={categories} questions={questions} routes={routes} />
      </section>
    </main>
  );
}
