import Link from "next/link";
import { Flame, Layers3 } from "lucide-react";

import { HomeRoutePanel } from "@/components/home-route-panel";
import { QuestionExplorer } from "@/components/question-explorer";
import { StudyOverview } from "@/components/study-overview";
import { getCategories, getQuestionMetas, getRoutes } from "@/lib/content";
import { getVisualCount } from "@/lib/visuals";

export default function Home() {
  const questions = getQuestionMetas();
  const categories = getCategories();
  const routes = getRoutes();
  const visualCount = getVisualCount();

  return (
    <main>
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-8 pt-6 sm:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:px-8 lg:pb-10 lg:pt-10">
        <div className="hero-panel min-h-[500px] overflow-hidden rounded-[2.2rem] p-6 sm:p-8 lg:p-11">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3.5 py-1.5 text-sm font-semibold text-ink/76 backdrop-blur-xl">
            <Flame className="h-4 w-4 text-coral" />
            Java 后端上岸路线 · 内容持续打磨
          </div>
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-teal/80">
              You Deserve
            </p>
            <h1 className="display-title text-[3.2rem] font-semibold leading-[0.98] tracking-[-0.05em] text-ink sm:text-[4.2rem] lg:text-[5.4rem]">
              你值得一个更清楚的上岸题库。
            </h1>
            <p className="mt-6 max-w-2xl text-[1.08rem] leading-8 text-ink/68">
              不堆概念，不写天书。每道题都按“一句话结论、通俗解释、面试回答、追问、易错点”组织，先让你听懂，再让你答稳。
            </p>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-ink/54">
              第一次来，建议先按路线刷 10 题；已经有基础，就直接搜高频关键词；想把学习轨迹沉淀下来，再登录开始记笔记和复盘。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="primary-action px-5 py-3 text-sm font-semibold" href="/#questions">
                从高频题开始
              </Link>
              <Link
                className="ghost-action px-5 py-3 text-sm font-semibold"
                href="/routes"
              >
                按路线开始刷
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-4">
            <div className="metric-tile">
              <span>{questions.length}</span>
              <p>已整理题目</p>
            </div>
            <div className="metric-tile">
              <span>{categories.length}</span>
              <p>核心专题</p>
            </div>
            <div className="metric-tile">
              <span>{visualCount}</span>
              <p>图解样板</p>
            </div>
            <div className="metric-tile">
              <span>0</span>
              <p>在线生成依赖</p>
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <HomeRoutePanel questions={questions} />

          <StudyOverview totalQuestions={questions.length} />

          <div className="rounded-[1.6rem] border border-white/70 bg-white/68 p-6 shadow-soft backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <Layers3 className="h-5 w-5 text-coral" />
              <h2 className="text-lg font-black text-ink">路线覆盖</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-ink/58">
              如果你不想自己判断先学什么，就直接从路线页往下推，能更快把高频题连成体系。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {routes.map((route) => (
                <Link className="rounded-full border border-white/70 bg-white/72 px-3 py-1.5 text-sm font-medium text-ink/70 backdrop-blur-xl transition hover:bg-white hover:text-ink" href="/routes" key={route}>
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
