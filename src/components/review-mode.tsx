"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookMarked,
  Clock3,
  Eye,
  GraduationCap,
  NotebookPen,
  Sparkles,
  Target,
  UserRound
} from "lucide-react";

import { useStudy } from "@/components/study-provider";
import type { QuestionMeta } from "@/lib/content";
import { derivePersonalInsights } from "@/lib/personal-insights";

type ReviewModeProps = {
  questions: QuestionMeta[];
};

type ReviewFilter = "smart" | "pending" | "favorites" | "notes" | "recent";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

export function ReviewMode({ questions }: ReviewModeProps) {
  const { currentUser, data, getOverview, ready } = useStudy();
  const [filter, setFilter] = useState<ReviewFilter>("smart");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const overview = ready
    ? getOverview()
    : {
        totalLikes: 0,
        totalFavorites: 0,
        masteredCount: 0,
        noteCount: 0,
        totalViews: 0,
        commentCount: 0
      };

  const personal = useMemo(() => {
    if (!ready) {
      return null;
    }

    return derivePersonalInsights(questions, data, currentUser);
  }, [currentUser, data, questions, ready]);

  const queue = useMemo(() => {
    if (!personal || !currentUser) {
      return [];
    }

    const unmastered = personal.entries.filter((entry) => !entry.activity.masteredBy.includes(currentUser));

    if (filter === "pending") {
      return unmastered.map((entry) => ({
        ...entry,
        priority: entry.activity.favoritedBy.includes(currentUser) ? 4 : 2,
        reasons: [entry.activity.favoritedBy.includes(currentUser) ? "还没掌握 · 已收藏" : "还没掌握"],
        view: entry.activity.viewedByUser[currentUser] ?? null
      }));
    }

    if (filter === "favorites") {
      return personal.favorites.map((entry) => ({
        ...entry,
        priority: entry.activity.masteredBy.includes(currentUser) ? 3 : 5,
        reasons: [entry.activity.masteredBy.includes(currentUser) ? "已收藏 · 可复盘" : "已收藏 · 待吃透"],
        view: entry.activity.viewedByUser[currentUser] ?? null
      }));
    }

    if (filter === "notes") {
      return personal.notes.map((entry) => ({
        ...entry,
        priority: entry.activity.masteredBy.includes(currentUser) ? 4 : 6,
        reasons: [entry.activity.masteredBy.includes(currentUser) ? "有笔记 · 值得回看" : "有笔记 · 说明卡过"],
        view: entry.activity.viewedByUser[currentUser] ?? null
      }));
    }

    if (filter === "recent") {
      return personal.history.slice(0, 20).map((entry) => ({
        ...entry,
        priority: entry.activity.masteredBy.includes(currentUser) ? 2 : 4,
        reasons: [entry.activity.masteredBy.includes(currentUser) ? "最近看过 · 可复盘" : "最近看过 · 还没掌握"],
        view: entry.view
      }));
    }

    return personal.reviewQueue;
  }, [currentUser, filter, personal]);

  const rawActiveIndex = useMemo(() => queue.findIndex((entry) => entry.question.slug === activeSlug), [activeSlug, queue]);
  const activeIndex = rawActiveIndex >= 0 ? rawActiveIndex : 0;
  const active = queue[activeIndex] ?? null;

  if (!ready) {
    return (
      <section className="rounded-[2rem] border border-ink/10 bg-white p-8 shadow-soft">
        <p className="text-lg font-black text-ink">正在为你生成复习队列...</p>
      </section>
    );
  }

  if (!currentUser || !personal) {
    return (
      <section className="profile-hero rounded-[2rem] border border-ink/10 p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.6rem] bg-ink text-mint shadow-soft">
            <UserRound className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm font-black uppercase tracking-[0.24em] text-coral">Review Mode</p>
          <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">先登录，再让复习有顺序。</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-ink/64 sm:text-lg">
            复习模式会根据你的浏览、收藏、掌握、笔记和评论自动排优先级。登录之后，它就不再是泛泛刷题，而是按你的学习轨迹接着推。
          </p>
        </div>
      </section>
    );
  }

  const progress = questions.length > 0 ? Math.round((overview.masteredCount / questions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="profile-hero rounded-[2rem] border border-ink/10 p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/75 px-3 py-1 text-sm font-black text-ink">
              <GraduationCap className="h-4 w-4 text-coral" />
              复习模式 · 连续刷题流
            </div>
            <h1 className="mt-5 text-4xl font-black text-ink sm:text-5xl">别再自己想下一道刷什么了。</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-ink/66 sm:text-lg">
              这里会按你的真实学习痕迹自动排队。不是简单按题目顺序，而是优先把“你碰过、收藏过、留过笔记、但还没掌握”的题推到前面。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link className="ghost-action" href="/me">
                <ArrowLeft className="h-4 w-4" />
                返回个人中心
              </Link>
              <Link className="primary-action" href={active ? `/questions/${active.question.slug}` : "/#questions"}>
                <Sparkles className="h-4 w-4" />
                {active ? "打开当前题目" : "先去题库看看"}
              </Link>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-ink/10 bg-white/78 p-5 shadow-soft">
            <p className="text-sm font-black text-ink/55">这轮复习概况</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-coral">{queue.length}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">当前队列</p>
              </div>
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-teal">{Math.max(questions.length - overview.masteredCount, 0)}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">待掌握</p>
              </div>
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-amber-strong">{overview.noteCount}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">有笔记题</p>
              </div>
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-ink">{progress}%</p>
                <p className="mt-1 text-sm font-bold text-ink/55">总进度</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap gap-2">
          {[
            ["smart", "智能队列"],
            ["pending", "未掌握"],
            ["favorites", "收藏回刷"],
            ["notes", "笔记回刷"],
            ["recent", "最近浏览"]
          ].map(([value, label]) => (
            <button
              className={`filter-chip ${filter === value ? "is-active" : ""}`}
              key={value}
              onClick={() => setFilter(value as ReviewFilter)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Current</p>
              <h2 className="mt-2 text-2xl font-black text-ink">当前主刷题</h2>
            </div>
            {active ? (
              <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
                第 {Math.max(activeIndex + 1, 1)} / {queue.length} 题
              </span>
            ) : null}
          </div>

          {active ? (
            <div className="mt-5 rounded-[1.6rem] border border-ink/10 bg-smoke/55 p-5">
              <div className="flex flex-wrap gap-2">
                <span className="status-chip">{active.question.category}</span>
                {active.reasons.map((reason) => (
                  <span className="status-chip" key={reason}>
                    {reason}
                  </span>
                ))}
              </div>

              <h3 className="mt-4 text-3xl font-black leading-tight text-ink">{active.question.title}</h3>
              <p className="mt-4 text-base leading-8 text-ink/64">{active.question.summary}</p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-black text-ink/56">
                <span className="mini-metric">
                  <Clock3 className="h-3.5 w-3.5" />
                  {active.question.readingTime} 分钟
                </span>
                {active.view ? (
                  <span className="mini-metric">
                    <Eye className="h-3.5 w-3.5" />
                    最近看于 {formatDate(active.view.lastViewedAt)}
                  </span>
                ) : null}
                {currentUser && active.activity.favoritedBy.includes(currentUser) ? (
                  <span className="mini-metric">
                    <Bookmark className="h-3.5 w-3.5" />
                    已收藏
                  </span>
                ) : null}
                {currentUser && active.activity.notesByUser[currentUser]?.trim() ? (
                  <span className="mini-metric">
                    <NotebookPen className="h-3.5 w-3.5" />
                    有笔记
                  </span>
                ) : null}
                {currentUser && active.activity.masteredBy.includes(currentUser) ? (
                  <span className="mini-metric">
                    <BookMarked className="h-3.5 w-3.5" />
                    已掌握
                  </span>
                ) : null}
              </div>

              {currentUser && active.activity.notesByUser[currentUser]?.trim() ? (
                <div className="mt-5 rounded-[1.2rem] bg-white px-4 py-4">
                  <p className="text-sm font-black text-teal">你的笔记抓手</p>
                  <p className="mt-2 text-sm leading-7 text-ink/66">{active.activity.notesByUser[currentUser].trim()}</p>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="primary-action" href={`/questions/${active.question.slug}`}>
                  <Target className="h-4 w-4" />
                  开始刷这道题
                </Link>
                <button
                  className="ghost-action"
                  disabled={activeIndex <= 0}
                  onClick={() => setActiveSlug(queue[Math.max(activeIndex - 1, 0)]?.question.slug ?? null)}
                  type="button"
                >
                  上一题
                </button>
                <button
                  className="ghost-action"
                  disabled={activeIndex >= queue.length - 1}
                  onClick={() => setActiveSlug(queue[Math.min(activeIndex + 1, queue.length - 1)]?.question.slug ?? null)}
                  type="button"
                >
                  下一题
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
              当前筛选下还没有复习队列。先去点几道收藏、写一条笔记或者标记掌握，队列就会开始自动长出来。
            </div>
          )}
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Queue</p>
              <h2 className="mt-2 text-2xl font-black text-ink">连续刷题列表</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              {queue.length} 道
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {queue.length > 0 ? (
              queue.slice(0, 12).map((entry) => {
                const activeItem = active?.question.slug === entry.question.slug;

                return (
                  <button
                    className={`review-list-item ${activeItem ? "is-active" : ""}`}
                    key={entry.question.slug}
                    onClick={() => setActiveSlug(entry.question.slug)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-teal">{entry.question.category}</p>
                        <p className="mt-2 text-base font-black leading-snug text-ink">{entry.question.title}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-coral">
                        {entry.priority}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.reasons.slice(0, 2).map((reason) => (
                        <span className="status-chip" key={reason}>
                          {reason}
                        </span>
                      ))}
                      {entry.view ? (
                        <span className="mini-metric">
                          <Eye className="h-3.5 w-3.5" />
                          {entry.view.count} 次
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                当前模式下没有可刷题目，换一个复习模式试试。
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
