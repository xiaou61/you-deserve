"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BookMarked,
  Clock3,
  Eye,
  GraduationCap,
  Heart,
  MessageSquare,
  NotebookPen,
  Search,
  Sparkles,
  Star,
  UserRound
} from "lucide-react";

import { useStudy } from "@/components/study-provider";
import type { QuestionMeta } from "@/lib/content";
import { derivePersonalInsights } from "@/lib/personal-insights";

type PersonalCenterProps = {
  questions: QuestionMeta[];
};

type AssetFilter = "all" | "favorites" | "notes" | "mastered" | "history";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

function formatDateOnly(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).format(new Date(iso));
}

function excerpt(text: string, max = 90) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max)}...` : normalized;
}

export function PersonalCenter({ questions }: PersonalCenterProps) {
  const { currentUser, data, getOverview, ready } = useStudy();
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [keyword, setKeyword] = useState("");
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

  const user = currentUser ? data.users.find((item) => item.username === currentUser) : null;
  const normalizedKeyword = keyword.trim().toLowerCase();
  const assetEntries = useMemo(() => {
    if (!personal) {
      return [];
    }

    const base =
      assetFilter === "favorites"
        ? personal.favorites
        : assetFilter === "notes"
          ? personal.notes
          : assetFilter === "mastered"
            ? personal.mastered
            : assetFilter === "history"
              ? personal.history
              : Array.from(
                  new Map(
                    [
                      ...personal.history,
                      ...personal.favorites,
                      ...personal.mastered,
                      ...personal.notes,
                      ...personal.likes
                    ].map((entry) => [entry.question.slug, entry])
                  ).values()
                );

    return base.filter((entry) => {
      if (!normalizedKeyword) {
        return true;
      }

      return [entry.question.title, entry.question.summary, entry.question.category, ...entry.question.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedKeyword);
    });
  }, [assetFilter, normalizedKeyword, personal]);

  if (!ready) {
    return (
      <section className="rounded-[2rem] border border-ink/10 bg-white p-8 shadow-soft">
        <p className="text-lg font-black text-ink">正在整理你的学习轨迹...</p>
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
          <p className="mt-6 text-sm font-black uppercase tracking-[0.24em] text-coral">Personal Center</p>
          <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">把你的学习轨迹收回来。</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-ink/64 sm:text-lg">
            登录后，这里会自动汇总你的浏览记录、收藏、点赞、掌握题目、笔记和评论。
            不是单纯摆个头像，而是给你一个能继续复盘和接着学的个人工作台。
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="profile-stat">
              <Eye className="h-5 w-5 text-teal" />
              <strong>浏览记录</strong>
              <span>看过哪些题、最后停在哪</span>
            </div>
            <div className="profile-stat">
              <Bookmark className="h-5 w-5 text-amber-strong" />
              <strong>收藏清单</strong>
              <span>需要回看的题集中收好</span>
            </div>
            <div className="profile-stat">
              <NotebookPen className="h-5 w-5 text-coral" />
              <strong>笔记沉淀</strong>
              <span>你真正容易忘的点都留在这</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const progress = questions.length > 0 ? Math.round((overview.masteredCount / questions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="profile-hero rounded-[2rem] border border-ink/10 p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/75 px-3 py-1 text-sm font-black text-ink">
              <Sparkles className="h-4 w-4 text-coral" />
              个人中心 · 数据库学习工作台
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-[1.6rem] bg-ink text-2xl font-black text-mint shadow-soft">
                {currentUser.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-teal">Welcome Back</p>
                <h1 className="mt-1 text-4xl font-black text-ink sm:text-5xl">{currentUser}</h1>
                <p className="mt-2 text-sm font-bold text-ink/54">
                  {user ? `加入于 ${formatDateOnly(user.createdAt)}` : "用户账号"} ·{" "}
                  {personal.latestVisit ? `最近学习 ${formatDate(personal.latestVisit)}` : "刚刚开始建立学习轨迹"}
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-base leading-8 text-ink/66 sm:text-lg">
              这里把你在站内的真实动作都收起来了：看过什么、喜欢什么、准备回刷什么、哪些已经掌握、哪些还卡着。
              不是摆设，是给你下一次打开站点时一个直接能接上的入口。
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-ink/10 bg-white/78 p-5 shadow-soft">
            <p className="text-sm font-black text-ink/55">当前学习状态</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-teal">{overview.masteredCount}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">已掌握</p>
              </div>
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-coral">{questions.length - overview.masteredCount}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">待补</p>
              </div>
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-amber-strong">{overview.totalViews}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">累计浏览</p>
              </div>
              <div className="rounded-2xl bg-smoke p-4">
                <p className="text-3xl font-black text-ink">{progress}%</p>
                <p className="mt-1 text-sm font-bold text-ink/55">掌握进度</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="profile-stat-card">
          <Eye className="h-5 w-5 text-teal" />
          <strong>{personal.history.length}</strong>
          <span>已留下浏览记录的题</span>
        </div>
        <div className="profile-stat-card">
          <Bookmark className="h-5 w-5 text-amber-strong" />
          <strong>{overview.totalFavorites}</strong>
          <span>收藏题目</span>
        </div>
        <div className="profile-stat-card">
          <Heart className="h-5 w-5 text-coral" />
          <strong>{overview.totalLikes}</strong>
          <span>点赞题目</span>
        </div>
        <div className="profile-stat-card">
          <BookMarked className="h-5 w-5 text-teal" />
          <strong>{overview.masteredCount}</strong>
          <span>掌握题目</span>
        </div>
        <div className="profile-stat-card">
          <NotebookPen className="h-5 w-5 text-coral" />
          <strong>{overview.noteCount}</strong>
          <span>我的笔记</span>
        </div>
        <div className="profile-stat-card">
          <MessageSquare className="h-5 w-5 text-ink" />
          <strong>{overview.commentCount}</strong>
          <span>我的评论</span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Continue</p>
              <h2 className="mt-2 text-2xl font-black text-ink">继续学下去</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              已跟踪 {personal.totalTracked} 道
            </span>
          </div>

          {personal.nextContinue ? (
            <Link className="profile-continue-card mt-5 block" href={`/questions/${personal.nextContinue.question.slug}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-black text-teal">{personal.nextContinue.question.category}</p>
                  <h3 className="mt-2 text-2xl font-black leading-snug text-ink">
                    {personal.nextContinue.question.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/62">
                    {personal.nextContinue.activity.masteredBy.includes(currentUser)
                      ? "这题你已经标成掌握，可以顺手回看一下笔记和评论，查缺补漏。"
                      : "这是你最近碰过但还没掌握的题，直接从这里续上最顺手。"}
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink text-white">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-ink/56">
                <span className="mini-metric">
                  <Clock3 className="h-3.5 w-3.5" />
                  {personal.nextContinue.question.readingTime} 分钟
                </span>
                <span className="mini-metric">
                  <Eye className="h-3.5 w-3.5" />
                  最近浏览 {formatDate(personal.nextContinue.view.lastViewedAt)}
                </span>
                <span className="mini-metric">
                  <Star className="h-3.5 w-3.5" />
                  累计看了 {personal.nextContinue.view.count} 次
                </span>
              </div>
            </Link>
          ) : (
            <div className="mt-5 rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
              你还没有留下浏览记录。随便打开一篇题，个人中心就会开始记住你的学习轨迹。
            </div>
          )}
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Categories</p>
            <h2 className="mt-2 text-2xl font-black text-ink">最近最常刷的专题</h2>
          </div>

          <div className="mt-5 space-y-3">
            {personal.hottestCategories.length > 0 ? (
              personal.hottestCategories.map(([category, count], index) => (
                <div className="profile-category-row" key={category}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="profile-rank">{index + 1}</span>
                      <div>
                        <p className="font-black text-ink">{category}</p>
                        <p className="text-xs font-bold text-ink/48">累计浏览 {count} 次</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-teal">
                      {Math.round((count / Math.max(overview.totalViews, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="profile-progress-track">
                    <div
                      className="profile-progress-fill"
                      style={{ width: `${Math.max(10, Math.round((count / Math.max(personal.hottestCategories[0][1], 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                等你刷过几道题，这里会自动长出你的专题偏好。
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Review Queue</p>
              <h2 className="mt-2 text-2xl font-black text-ink">现在最值得回刷的题</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              自动按优先级排序
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {personal.reviewQueue.length > 0 ? (
              personal.reviewQueue.slice(0, 6).map((entry) => (
                <Link className="profile-queue-card" href={`/questions/${entry.question.slug}`} key={entry.question.slug}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="status-chip">{entry.question.category}</span>
                        {entry.reasons.map((reason) => (
                          <span className="status-chip" key={reason}>
                            {reason}
                          </span>
                        ))}
                      </div>
                      <h3 className="mt-3 text-xl font-black leading-snug text-ink">{entry.question.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-ink/60">{entry.question.summary}</p>
                    </div>
                    <div className="rounded-2xl bg-smoke px-3 py-2 text-right">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/45">优先级</p>
                      <p className="mt-1 text-2xl font-black text-coral">{entry.priority}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-ink/56">
                    <span className="mini-metric">
                      <Clock3 className="h-3.5 w-3.5" />
                      {entry.question.readingTime} 分钟
                    </span>
                    {entry.view ? (
                      <span className="mini-metric">
                        <Eye className="h-3.5 w-3.5" />
                        最近看于 {formatDate(entry.view.lastViewedAt)}
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                你现在还没有形成明显的复习队列。等收藏、记笔记、反复浏览之后，这里会自动把优先回看的题顶上来。
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <Link className="primary-action" href="/review">
              <GraduationCap className="h-4 w-4" />
              进入复习模式
            </Link>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Snapshot</p>
            <h2 className="mt-2 text-2xl font-black text-ink">这一段学习像什么</h2>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="profile-summary-card">
              <strong>最近学习节奏</strong>
              <p>
                {personal.latestVisit
                  ? `你最近一次打开题目是在 ${formatDate(personal.latestVisit)}，说明这个账号已经开始形成真实学习轨迹。`
                  : "你还没留下浏览记录，轨迹会从第一次点开题目开始长出来。"}
              </p>
            </div>
            <div className="profile-summary-card">
              <strong>最常用的沉淀动作</strong>
              <p>
                {overview.noteCount >= overview.totalFavorites
                  ? "你更偏向把知识写进笔记里，适合继续强化“自己的话复述”和错点记录。"
                  : "你更偏向先收藏再回看，后面如果能配合笔记，复习效率会更稳。"}
              </p>
            </div>
            <div className="profile-summary-card">
              <strong>下一步建议</strong>
              <p>
                {overview.masteredCount === 0
                  ? "先把最近看过的题里最熟的一道标成掌握，让个人中心开始真正区分“看过”和“会了”。"
                  : "优先处理复习队列里“还没掌握 + 你收藏过/留过笔记”的题，这些通常就是最容易卡壳又最值得补的部分。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">History</p>
              <h2 className="mt-2 text-2xl font-black text-ink">浏览记录</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              最近 {Math.min(personal.history.length, 8)} 条
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {personal.history.length > 0 ? (
              personal.history.slice(0, 8).map((entry) => (
                <Link className="profile-list-card" href={`/questions/${entry.question.slug}`} key={entry.question.slug}>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-teal">{entry.question.category}</p>
                    <h3 className="mt-2 text-lg font-black leading-snug text-ink">{entry.question.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-ink/58">{entry.question.summary}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                    <span className="text-sm font-black text-ink">{formatDate(entry.view.lastViewedAt)}</span>
                    <span className="mini-metric">
                      <Eye className="h-3.5 w-3.5" />
                      看了 {entry.view.count} 次
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                这里还空着。等你开始刷题，它就会按时间顺序记住你最近看过什么。
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Collection</p>
              <h2 className="mt-2 text-2xl font-black text-ink">收藏 / 点赞 / 掌握</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="profile-cluster">
              <div className="flex items-center gap-2 text-sm font-black text-amber-strong">
                <Bookmark className="h-4 w-4" />
                收藏 {personal.favorites.length}
              </div>
              <div className="mt-3 space-y-2">
                {personal.favorites.slice(0, 4).map((entry) => (
                  <Link className="profile-mini-link" href={`/questions/${entry.question.slug}`} key={entry.question.slug}>
                    {entry.question.title}
                  </Link>
                ))}
                {personal.favorites.length === 0 ? <p className="profile-empty-copy">还没有收藏题。</p> : null}
              </div>
            </div>

            <div className="profile-cluster">
              <div className="flex items-center gap-2 text-sm font-black text-coral">
                <Heart className="h-4 w-4" />
                点赞 {personal.likes.length}
              </div>
              <div className="mt-3 space-y-2">
                {personal.likes.slice(0, 4).map((entry) => (
                  <Link className="profile-mini-link" href={`/questions/${entry.question.slug}`} key={entry.question.slug}>
                    {entry.question.title}
                  </Link>
                ))}
                {personal.likes.length === 0 ? <p className="profile-empty-copy">还没有点赞题。</p> : null}
              </div>
            </div>

            <div className="profile-cluster">
              <div className="flex items-center gap-2 text-sm font-black text-teal">
                <BookMarked className="h-4 w-4" />
                掌握 {personal.mastered.length}
              </div>
              <div className="mt-3 space-y-2">
                {personal.mastered.slice(0, 4).map((entry) => (
                  <Link className="profile-mini-link" href={`/questions/${entry.question.slug}`} key={entry.question.slug}>
                    {entry.question.title}
                  </Link>
                ))}
                {personal.mastered.length === 0 ? <p className="profile-empty-copy">还没有标记掌握。</p> : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Assets</p>
            <h2 className="mt-2 text-2xl font-black text-ink">我的学习资产</h2>
            <p className="mt-2 text-sm leading-7 text-ink/58">
              把浏览、收藏、掌握、笔记这些散落动作合成一张可筛选的清单，后面复盘会轻松很多。
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              className="profile-search-input"
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜标题、分类、标签..."
              type="search"
              value={keyword}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            ["all", "全部"],
            ["favorites", "收藏"],
            ["notes", "笔记"],
            ["mastered", "掌握"],
            ["history", "浏览"]
          ].map(([value, label]) => (
            <button
              className={`filter-chip ${assetFilter === value ? "is-active" : ""}`}
              key={value}
              onClick={() => setAssetFilter(value as AssetFilter)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {assetEntries.length > 0 ? (
            assetEntries.slice(0, 12).map((entry) => {
              const note = currentUser ? entry.activity.notesByUser[currentUser]?.trim() : "";
              const viewed = currentUser ? entry.activity.viewedByUser[currentUser] : null;

              return (
                <Link className="profile-list-card" href={`/questions/${entry.question.slug}`} key={`${assetFilter}-${entry.question.slug}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="status-chip">{entry.question.category}</span>
                        {currentUser && entry.activity.favoritedBy.includes(currentUser) ? (
                          <span className="status-chip is-favorited">已收藏</span>
                        ) : null}
                        {currentUser && entry.activity.masteredBy.includes(currentUser) ? (
                          <span className="status-chip is-mastered">已掌握</span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-lg font-black leading-snug text-ink">{entry.question.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-ink/58">{entry.question.summary}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink/36" />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-ink/56">
                    {viewed ? (
                      <span className="mini-metric">
                        <Eye className="h-3.5 w-3.5" />
                        {viewed.count} 次浏览
                      </span>
                    ) : null}
                    {currentUser && entry.activity.likedBy.includes(currentUser) ? (
                      <span className="mini-metric">
                        <Heart className="h-3.5 w-3.5" />
                        已点赞
                      </span>
                    ) : null}
                    {note ? (
                      <span className="mini-metric">
                        <NotebookPen className="h-3.5 w-3.5" />
                        有笔记
                      </span>
                    ) : null}
                  </div>

                  {note ? <p className="mt-3 text-sm leading-7 text-ink/62">笔记摘要：{excerpt(note, 72)}</p> : null}
                </Link>
              );
            })
          ) : (
            <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55 lg:col-span-2">
              当前筛选下还没有内容。换个标签，或者先去题目页点一点收藏、写一条笔记也行。
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Notes</p>
              <h2 className="mt-2 text-2xl font-black text-ink">我的笔记</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              {personal.notes.length} 条
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {personal.notes.length > 0 ? (
              personal.notes.slice(0, 6).map((entry) => (
                <Link className="profile-note-card" href={`/questions/${entry.question.slug}`} key={entry.question.slug}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-teal">{entry.question.category}</p>
                      <h3 className="mt-2 text-lg font-black text-ink">{entry.question.title}</h3>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink/36" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-ink/64">{excerpt(entry.note, 120)}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                你还没写笔记。等你把真正容易忘的点记下来，这里会变成你的复习捷径。
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Comments</p>
              <h2 className="mt-2 text-2xl font-black text-ink">我的评论</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              {personal.comments.length} 条
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {personal.comments.length > 0 ? (
              personal.comments.slice(0, 6).map(({ comment, question }) => (
                <Link className="comment-card block" href={`/questions/${question.slug}`} key={comment.id}>
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm font-black text-ink">{question.title}</strong>
                    <span className="text-xs font-bold text-ink/45">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-ink/66">{comment.content}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                讨论区还没留下你的痕迹。后面碰到卡壳的题，可以直接把问题丢进去。
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
