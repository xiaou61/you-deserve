"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BookHeart,
  BookMarked,
  CheckCircle2,
  Clock3,
  Eye,
  GraduationCap,
  Heart,
  Layers3,
  NotebookPen,
  RotateCcw,
  Sparkles,
  Target,
  UserRound
} from "lucide-react";

import { useStudy } from "@/components/study-provider";
import type { QuestionMeta } from "@/lib/content";
import type { ReviewSessionSummary } from "@/lib/study-store";
import { derivePersonalInsights } from "@/lib/personal-insights";

type ReviewModeProps = {
  questions: QuestionMeta[];
  initialFilter?: ReviewFilter;
  initialCategory?: string | null;
  initialRoute?: string | null;
  initialSlugScope?: string[];
  initialBundleName?: string | null;
  initialFromBundleName?: string | null;
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

function getReviewSessionHref(session: ReviewSessionSummary) {
  const params = new URLSearchParams();

  params.set("filter", session.filter);

  if (session.bundleName) {
    params.set("bundle", session.bundleName);
  }

  if (session.category) {
    params.set("category", session.category);
  }

  if (session.route) {
    params.set("route", session.route);
  }

  return `/review?${params.toString()}`;
}

function getNamedSlugReviewHref(
  slugs: string[],
  bundleName: string,
  filter: ReviewFilter = "smart",
  fromBundleName?: string | null
) {
  if (slugs.length === 0) {
    return "/review";
  }

  const params = new URLSearchParams();
  params.set("filter", filter);
  params.set("slugs", slugs.join(","));
  params.set("bundle", bundleName);
  if (fromBundleName) {
    params.set("fromBundle", fromBundleName);
  }

  return `/review?${params.toString()}`;
}

export function ReviewMode({
  questions,
  initialFilter = "smart",
  initialCategory = null,
  initialRoute = null,
  initialSlugScope = [],
  initialBundleName = null,
  initialFromBundleName = null
}: ReviewModeProps) {
  const { currentUser, data, getOverview, getReviewSessions, ready, saveReviewSession, toggleFavorite, toggleLike, toggleMastered } =
    useStudy();
  const [filter, setFilter] = useState<ReviewFilter>(initialFilter);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [sessionDone, setSessionDone] = useState<string[]>([]);
  const [sessionLater, setSessionLater] = useState<string[]>([]);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [message, setMessage] = useState("");
  const savedSessionIdRef = useRef<string | null>(null);
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

  const scopedQueue = useMemo(() => {
    const filteredByCategory = initialCategory
      ? queue.filter((entry) => entry.question.category === initialCategory)
      : queue;
    const filteredByRoute = initialRoute
      ? filteredByCategory.filter((entry) => entry.question.route === initialRoute)
      : filteredByCategory;
    const filteredBySlugScope =
      initialSlugScope.length > 0
        ? filteredByRoute.filter((entry) => initialSlugScope.includes(entry.question.slug))
        : filteredByRoute;

    return filteredBySlugScope;
  }, [initialCategory, initialRoute, initialSlugScope, queue]);

  const visibleQueue = useMemo(
    () => scopedQueue.filter((entry) => !sessionDone.includes(entry.question.slug) && !sessionLater.includes(entry.question.slug)),
    [scopedQueue, sessionDone, sessionLater]
  );

  const activeSlug = useMemo(() => {
    if (selectedSlug && visibleQueue.some((entry) => entry.question.slug === selectedSlug)) {
      return selectedSlug;
    }

    return visibleQueue[0]?.question.slug ?? null;
  }, [selectedSlug, visibleQueue]);

  const rawActiveIndex = useMemo(
    () => visibleQueue.findIndex((entry) => entry.question.slug === activeSlug),
    [activeSlug, visibleQueue]
  );
  const activeIndex = rawActiveIndex >= 0 ? rawActiveIndex : 0;
  const active = visibleQueue[activeIndex] ?? null;
  const sessionCompleted = sessionDone.length;
  const completedEntries = useMemo(
    () => scopedQueue.filter((entry) => sessionDone.includes(entry.question.slug)),
    [scopedQueue, sessionDone]
  );
  const laterEntries = useMemo(
    () => scopedQueue.filter((entry) => sessionLater.includes(entry.question.slug) && !sessionDone.includes(entry.question.slug)),
    [scopedQueue, sessionDone, sessionLater]
  );
  const scopeLabel =
    initialSlugScope.length > 0
      ? initialBundleName
        ? `${initialBundleName} · ${initialSlugScope.length} 题`
        : `题单范围：${initialSlugScope.length} 题`
      : initialCategory
        ? `分类：${initialCategory}`
        : initialRoute
          ? `路线：${initialRoute}`
          : null;
  const slugScopeEntries =
    initialSlugScope.length > 0 ? scopedQueue.filter((entry) => initialSlugScope.includes(entry.question.slug)) : [];
  const reviewSessions = ready ? getReviewSessions() : [];
  const latestSession = reviewSessions[0] ?? null;
  const nextRecommendedActions = useMemo(() => {
    if (!personal || !currentUser || !initialBundleName || visibleQueue.length > 0 || sessionCompleted <= 0) {
      return [];
    }

    const fromLater = laterEntries.map((entry) => entry.question.slug);
    const hardRecovery = personal.reviewQueue
      .filter(
        (entry) =>
          !entry.activity.masteredBy.includes(currentUser) &&
          ((entry.view?.count ?? 0) >= 2 ||
            !!entry.activity.notesByUser[currentUser]?.trim() ||
            entry.activity.favoritedBy.includes(currentUser))
      )
      .slice(0, 6)
      .map((entry) => entry.question.slug);
    const weeklyFocus = [...personal.categoryFocus]
      .sort((left, right) => right.gapScore - left.gapScore)
      .slice(0, 2)
      .flatMap((focus) => personal.reviewQueue.filter((entry) => entry.question.category === focus.category).slice(0, 3))
      .filter((entry, index, list) => list.findIndex((item) => item.question.slug === entry.question.slug) === index)
      .slice(0, 6)
      .map((entry) => entry.question.slug);
    const quickSprint = personal.reviewQueue
      .filter((entry) => !entry.activity.masteredBy.includes(currentUser))
      .slice()
      .sort((left, right) => left.question.readingTime - right.question.readingTime)
      .slice(0, 4)
      .map((entry) => entry.question.slug);

    return [
      fromLater.length > 0
        ? {
            title: "先把这轮稍后题收回来",
            description: `你刚刷完「${initialBundleName}」，现在最顺手的是把刚才暂时跳过的 ${fromLater.length} 道题接着处理。`,
            href: getNamedSlugReviewHref(fromLater, "本轮稍后题回收", "smart", initialBundleName),
            cta: "继续收稍后题"
          }
        : null,
      weeklyFocus.length > 0
        ? {
            title: "转去本周重点包",
            description: "继续处理差距分最高的分类，不让刚形成的手感散掉。",
            href: getNamedSlugReviewHref(weeklyFocus, "本周重点包", "smart", initialBundleName),
            cta: "去刷本周重点"
          }
        : null,
      hardRecovery.length > 0
        ? {
            title: "顺手清明显卡壳题",
            description: "把反复看过、留过笔记或收藏过但还没稳住的题再收一轮。",
            href: getNamedSlugReviewHref(hardRecovery, "明显卡壳题回收", "smart", initialBundleName),
            cta: "去清卡壳题"
          }
        : null,
      quickSprint.length > 0
        ? {
            title: "再开一轮快刷包",
            description: "如果时间不多，可以接一个更短的小包把节奏续住。",
            href: getNamedSlugReviewHref(quickSprint, "30 分钟快刷包", "smart", initialBundleName),
            cta: "接着快刷"
          }
        : null,
      {
        title: "回到全量智能队列",
        description: "想重新交给系统排优先级，就直接切回全量复习模式继续。",
        href: "/review",
        cta: "回全量队列"
      }
    ].filter((item): item is { title: string; description: string; href: string; cta: string } => Boolean(item));
  }, [currentUser, initialBundleName, laterEntries, personal, sessionCompleted, visibleQueue.length]);

  useEffect(() => {
    if (!ready || !currentUser || visibleQueue.length > 0 || sessionCompleted <= 0) {
      return;
    }

    const sessionId = [
      currentUser,
      filter,
      initialCategory ?? "all",
      initialRoute ?? "all",
      [...sessionDone].sort().join("|")
    ].join("::");

    if (savedSessionIdRef.current === sessionId) {
      return;
    }

    saveReviewSession({
      id: sessionId,
      user: currentUser,
      finishedAt: new Date().toISOString(),
      filter,
      bundleName: initialBundleName,
      fromBundleName: initialFromBundleName,
      category: initialCategory,
      route: initialRoute,
      completedCount: sessionCompleted,
      laterCount: laterEntries.length,
      masteredCount: completedEntries.filter((entry) => entry.activity.masteredBy.includes(currentUser)).length,
      completedSlugs: completedEntries.map((entry) => entry.question.slug),
      laterSlugs: laterEntries.map((entry) => entry.question.slug),
      categories: Array.from(new Set(completedEntries.map((entry) => entry.question.category))).slice(0, 4)
    });
    savedSessionIdRef.current = sessionId;
  }, [
    completedEntries,
    currentUser,
    filter,
    initialBundleName,
    initialFromBundleName,
    getReviewSessions,
    initialCategory,
    initialRoute,
    laterEntries,
    ready,
    saveReviewSession,
    sessionCompleted,
    sessionDone,
    visibleQueue.length
  ]);

  const markDone = (slug: string | null) => {
    if (!slug) {
      return;
    }

    setSessionLater((previous) => previous.filter((item) => item !== slug));
    setSessionDone((previous) => (previous.includes(slug) ? previous : [...previous, slug]));
    setMessage("这道题先从本轮队列划掉了，继续往下刷。");
  };

  const markLater = (slug: string | null) => {
    if (!slug) {
      return;
    }

    setSessionDone((previous) => previous.filter((item) => item !== slug));
    setSessionLater((previous) => (previous.includes(slug) ? previous : [...previous, slug]));
    setMessage("这道题先挪到稍后再看，先保证这一轮不断节奏。");
  };

  const handleQuickAction = async (
    action: Promise<{ ok: boolean; message: string }>,
    options?: { markCurrentDone?: boolean }
  ) => {
    const result = await action;
    setMessage(result.message);

    if (result.ok && options?.markCurrentDone && active) {
      markDone(active.question.slug);
    }
  };

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
                <p className="text-3xl font-black text-coral">{visibleQueue.length}</p>
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
            <div className="mt-4 rounded-2xl bg-smoke p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-ink">本轮已完成 {sessionCompleted} 题</p>
                  <p className="mt-1 text-xs font-bold text-ink/55">做完一题就先划走，保持连续刷下去的手感。</p>
                </div>
                {sessionCompleted > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {sessionLater.length > 0 ? (
                      <button
                        className="ghost-action"
                        onClick={() => {
                          setSessionLater([]);
                          setMessage("已把稍后再看的题放回当前队列。");
                        }}
                        type="button"
                      >
                        <RotateCcw className="h-4 w-4" />
                        恢复稍后
                      </button>
                    ) : null}
                    <button
                      className="ghost-action"
                      onClick={() => {
                        setSessionDone([]);
                        setSessionLater([]);
                        savedSessionIdRef.current = null;
                        setMessage("已恢复本轮复习队列。");
                      }}
                      type="button"
                    >
                      <RotateCcw className="h-4 w-4" />
                      恢复本轮
                    </button>
                  </div>
                ) : null}
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
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-bold text-ink/64">
              <input
                checked={autoAdvance}
                className="h-4 w-4 accent-ink"
                onChange={(event) => setAutoAdvance(event.target.checked)}
                type="checkbox"
              />
              标记掌握后自动推进下一题
            </label>
            {scopeLabel ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-smoke px-3 py-1.5 text-sm font-bold text-ink/68">
                <Target className="h-4 w-4 text-coral" />
                当前范围：{scopeLabel}
                <Link className="text-teal underline-offset-4 hover:underline" href="/review">
                  清掉范围
                </Link>
              </div>
            ) : null}
          </div>
          {message ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-smoke px-4 py-2 text-sm font-bold text-ink/68">
              <Sparkles className="h-4 w-4 text-coral" />
              {message}
            </div>
          ) : null}
        </div>
        {initialSlugScope.length > 0 ? (
          <div className="mt-4 rounded-[1.3rem] bg-smoke px-4 py-4">
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink/65">
              <span className="status-chip">来源：{initialBundleName ?? "自定义题单"}</span>
              {initialFromBundleName ? <span className="status-chip">衔接自：{initialFromBundleName}</span> : null}
              <span className="status-chip">共 {initialSlugScope.length} 题</span>
              {slugScopeEntries.slice(0, 3).map((entry) => (
                <span className="status-chip" key={entry.question.slug}>
                  {entry.question.category}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-7 text-ink/60">
              {initialBundleName
                ? `这一轮是从「${initialBundleName}」直接带过来的${initialFromBundleName ? `，它衔接自「${initialFromBundleName}」` : ""}，不是全量智能队列。适合快速处理一个明确任务，再回到总复习流。`
                : "这一轮不是全量智能队列，而是只处理你明确圈出来的那几题。更适合拿来收上轮稍后题、错题小清单，或者一把清掉某批卡点。"}
            </p>
          </div>
        ) : null}
      </section>

      {latestSession ? (
        <section className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Last Round</p>
              <h2 className="mt-2 text-2xl font-black text-ink">上一轮复习刚推进了什么</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              {formatDate(latestSession.finishedAt)}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="profile-stat-card">
              <CheckCircle2 className="h-5 w-5 text-teal" />
              <strong>{latestSession.completedCount}</strong>
              <span>完成题数</span>
            </div>
            <div className="profile-stat-card">
              <BookMarked className="h-5 w-5 text-coral" />
              <strong>{latestSession.masteredCount}</strong>
              <span>掌握完成</span>
            </div>
            <div className="profile-stat-card">
              <Clock3 className="h-5 w-5 text-amber-strong" />
              <strong>{latestSession.laterCount}</strong>
              <span>稍后再看</span>
            </div>
            <div className="profile-stat-card">
              <Layers3 className="h-5 w-5 text-ink" />
              <strong>{latestSession.categories.length}</strong>
              <span>覆盖分类</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-ink/65">
            {latestSession.category ? <span className="status-chip">分类：{latestSession.category}</span> : null}
            {latestSession.route ? <span className="status-chip">路线：{latestSession.route}</span> : null}
            <span className="status-chip">模式：{latestSession.filter}</span>
            {latestSession.laterSlugs.length > 0 ? <span className="status-chip">稍后 {latestSession.laterSlugs.length} 题</span> : null}
            {latestSession.categories.map((item) => (
              <span className="status-chip" key={item}>
                {item}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="ghost-action" href={getReviewSessionHref(latestSession)}>
              <GraduationCap className="h-4 w-4" />
              按这轮范围再来一轮
            </Link>
            {latestSession.laterSlugs.length > 0 ? (
              <Link
                className="ghost-action"
                href={`/review?filter=smart&slugs=${encodeURIComponent(latestSession.laterSlugs.join(","))}`}
              >
                <Clock3 className="h-4 w-4" />
                优先收稍后题
              </Link>
            ) : null}
            <Link className="ghost-action" href="/me">
              <ArrowLeft className="h-4 w-4" />
              回个人中心看整体进展
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Current</p>
              <h2 className="mt-2 text-2xl font-black text-ink">当前主刷题</h2>
            </div>
            {active ? (
              <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
                第 {Math.max(activeIndex + 1, 1)} / {visibleQueue.length} 题
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

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className={`engagement-action ${active.activity.likedBy.includes(currentUser) ? "is-active" : ""}`}
                  onClick={() => void handleQuickAction(toggleLike(active.question.slug))}
                  type="button"
                >
                  <Heart className="h-4 w-4" />
                  {active.activity.likedBy.includes(currentUser) ? "已点赞" : "点赞"}
                </button>
                <button
                  className={`engagement-action ${active.activity.favoritedBy.includes(currentUser) ? "is-active" : ""}`}
                  onClick={() => void handleQuickAction(toggleFavorite(active.question.slug))}
                  type="button"
                >
                  <Bookmark className="h-4 w-4" />
                  {active.activity.favoritedBy.includes(currentUser) ? "已收藏" : "收藏"}
                </button>
                <button
                  className={`engagement-action ${active.activity.masteredBy.includes(currentUser) ? "is-active mastered" : ""}`}
                  onClick={() =>
                    void handleQuickAction(toggleMastered(active.question.slug), {
                      markCurrentDone: autoAdvance && !active.activity.masteredBy.includes(currentUser)
                    })
                  }
                  type="button"
                >
                  <BookHeart className="h-4 w-4" />
                  {active.activity.masteredBy.includes(currentUser) ? "已掌握" : "标记掌握"}
                </button>
                <button
                  className="ghost-action"
                  onClick={() => markDone(active.question.slug)}
                  type="button"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  这题本轮先完成
                </button>
                <button
                  className="ghost-action"
                  onClick={() => markLater(active.question.slug)}
                  type="button"
                >
                  <Clock3 className="h-4 w-4" />
                  稍后再看
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="primary-action" href={`/questions/${active.question.slug}`}>
                  <Target className="h-4 w-4" />
                  开始刷这道题
                </Link>
                <button
                  className="ghost-action"
                  disabled={activeIndex <= 0}
                  onClick={() => setSelectedSlug(visibleQueue[Math.max(activeIndex - 1, 0)]?.question.slug ?? null)}
                  type="button"
                >
                  上一题
                </button>
                <button
                  className="ghost-action"
                  disabled={activeIndex >= visibleQueue.length - 1}
                  onClick={() =>
                    setSelectedSlug(visibleQueue[Math.min(activeIndex + 1, visibleQueue.length - 1)]?.question.slug ?? null)
                  }
                  type="button"
                >
                  下一题
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
              {sessionCompleted > 0
                ? "这一轮已经被你刷空了。你可以恢复本轮，或者换个筛选模式继续推进。"
                : scopeLabel
                  ? `当前范围下还没有可刷题目。你可以清掉范围，或者先在这条线里留下收藏、笔记和浏览轨迹。`
                  : "当前筛选下还没有复习队列。先去点几道收藏、写一条笔记或者标记掌握，队列就会开始自动长出来。"}
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
              {visibleQueue.length} 道
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {visibleQueue.length > 0 ? (
              visibleQueue.slice(0, 12).map((entry) => {
                const activeItem = active?.question.slug === entry.question.slug;

                return (
                  <button
                    className={`review-list-item ${activeItem ? "is-active" : ""}`}
                    key={entry.question.slug}
                    onClick={() => setSelectedSlug(entry.question.slug)}
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
                {sessionCompleted > 0 ? "这一轮已经完成，恢复队列或切换模式继续。" : "当前模式下没有可刷题目，换一个复习模式试试。"}
                {scopeLabel ? ` 当前还带着${scopeLabel}。` : ""}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Session</p>
              <h2 className="mt-2 text-2xl font-black text-ink">本轮复习完成情况</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              完成 {sessionCompleted} 题
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="profile-stat-card">
              <CheckCircle2 className="h-5 w-5 text-teal" />
              <strong>{sessionCompleted}</strong>
              <span>本轮完成</span>
            </div>
            <div className="profile-stat-card">
              <BookMarked className="h-5 w-5 text-coral" />
              <strong>{completedEntries.filter((entry) => !entry.activity.masteredBy.includes(currentUser)).length}</strong>
              <span>先划走待回看</span>
            </div>
            <div className="profile-stat-card">
              <Target className="h-5 w-5 text-amber-strong" />
              <strong>{visibleQueue.length}</strong>
              <span>队列剩余</span>
            </div>
            <div className="profile-stat-card">
              <Clock3 className="h-5 w-5 text-ink" />
              <strong>{laterEntries.length}</strong>
              <span>稍后再看</span>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Completed</p>
              <h2 className="mt-2 text-2xl font-black text-ink">本轮已经刷过的题</h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {completedEntries.length > 0 ? (
              completedEntries.slice(-6).reverse().map((entry) => (
                <div className="review-completed-card" key={entry.question.slug}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-teal">{entry.question.category}</p>
                      <p className="mt-2 text-base font-black leading-snug text-ink">{entry.question.title}</p>
                    </div>
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.reasons.slice(0, 2).map((reason) => (
                      <span className="status-chip" key={reason}>
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                你还没从本轮里划掉题目。做完一题就点“这题本轮先完成”，收尾感会明显好很多。
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Later</p>
            <h2 className="mt-2 text-2xl font-black text-ink">这一轮先放到后面的题</h2>
          </div>
          <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
            {laterEntries.length} 道
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {laterEntries.length > 0 ? (
            laterEntries.map((entry) => (
              <div className="review-later-card" key={entry.question.slug}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="status-chip">{entry.question.category}</span>
                      {entry.reasons.slice(0, 2).map((reason) => (
                        <span className="status-chip" key={reason}>
                          {reason}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-3 text-lg font-black leading-snug text-ink">{entry.question.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-ink/60">{entry.question.summary}</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      className="ghost-action"
                      onClick={() => {
                        setSessionLater((previous) => previous.filter((item) => item !== entry.question.slug));
                        setSelectedSlug(entry.question.slug);
                        setMessage("已把这道题拉回当前队列。");
                      }}
                      type="button"
                    >
                      重新加入当前轮
                    </button>
                    <Link className="primary-action" href={`/questions/${entry.question.slug}`}>
                      开题回看
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
              暂时没有被你挪到后面的题。碰到这轮不想硬啃的卡点时，可以先放这里，别把节奏拖死。
            </div>
          )}
        </div>
      </section>

      {visibleQueue.length === 0 && sessionCompleted > 0 ? (
        <section className="rounded-[1.9rem] border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-mint/70 px-3 py-1.5 text-sm font-black text-ink">
                <CheckCircle2 className="h-4 w-4 text-teal" />
                本轮复习已完成
              </div>
              <h2 className="mt-4 text-3xl font-black text-ink">这一轮先收住，你已经把队列刷空了。</h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-ink/62">
                {initialBundleName
                  ? `这一轮你已经把「${initialBundleName}」刷空了，一共处理了 ${sessionCompleted} 道题。最好的下一步不是乱跳，而是顺着当前任务感继续接一包。`
                  : `本轮一共处理了 ${sessionCompleted} 道题。现在最适合做的不是乱跳，而是回个人中心看目标、里程碑和最容易忘的题，再决定下一轮从哪条线继续。`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className="primary-action" href="/me">
                <GraduationCap className="h-4 w-4" />
                回个人中心
              </Link>
              <button
                className="ghost-action"
                onClick={() => {
                  setSessionDone([]);
                  setSessionLater([]);
                  savedSessionIdRef.current = null;
                  setMessage("已恢复本轮复习队列。");
                }}
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
                再来一轮
              </button>
            </div>
          </div>

          {nextRecommendedActions.length > 0 ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {nextRecommendedActions.slice(0, 4).map((action) => (
                <div className="review-completed-card" key={action.title}>
                  <strong className="text-base font-black text-ink">{action.title}</strong>
                  <p className="mt-2 text-sm leading-7 text-ink/60">{action.description}</p>
                  <div className="mt-4">
                    <Link className="ghost-action" href={action.href}>
                      <Sparkles className="h-4 w-4" />
                      {action.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
