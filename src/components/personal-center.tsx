"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  Bookmark,
  BookMarked,
  CalendarDays,
  Clock3,
  Eye,
  Flame,
  Gauge,
  GraduationCap,
  Heart,
  Layers3,
  MessageSquare,
  NotebookPen,
  Search,
  Sparkles,
  Star,
  Target,
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

function getRhythmLabel(streak: number) {
  if (streak >= 7) {
    return "已经形成稳定节奏";
  }

  if (streak >= 3) {
    return "这几天状态是连着的";
  }

  if (streak >= 1) {
    return "刚开始起势";
  }

  return "还没进入连续学习状态";
}

function getGoalTone(done: boolean) {
  return done ? "is-complete" : "";
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
  const maxRecentViews = Math.max(...personal.recentActivity.map((day) => day.views), 1);
  const suggestions = [
    personal.reviewQueue[0]
      ? {
          title: "先清最该回刷的题",
          description: `优先把「${personal.reviewQueue[0].question.title}」过一遍，它现在排在你的复习队列最前面。`
        }
      : null,
    overview.noteCount < Math.max(2, overview.totalFavorites)
      ? {
          title: "收藏不少，笔记还偏少",
          description: "下一轮不要只收藏，至少给最容易忘的两道题各写一句自己的话。"
        }
      : {
          title: "笔记沉淀已经开始起作用",
          description: "你已经不只是点收藏了，接下来适合把有笔记但未掌握的题重点回刷。"
        },
    personal.currentStreak >= 3
      ? {
          title: "别断掉这波连学",
          description: `你已经连续学了 ${personal.currentStreak} 天，今天哪怕只过一题，也比断档值钱。`
        }
      : {
          title: "把节奏先连起来",
          description: "连续 3 天哪怕每天只看 1 题，个人中心的数据就会开始明显变得有判断力。"
        }
  ].filter((item): item is { title: string; description: string } => !!item);
  const goals = [
    {
      title: "今日目标",
      detail: personal.recentActivity[6]?.views > 0 ? "今天已经打开过题目了" : "今天至少打开 1 道题",
      progressText: personal.recentActivity[6]?.views > 0 ? `${personal.recentActivity[6]?.views} 次浏览` : "0 / 1",
      done: (personal.recentActivity[6]?.views ?? 0) > 0
    },
    {
      title: "本周目标",
      detail: "本周累计至少浏览 8 次，别让节奏断掉",
      progressText: `${Math.min(personal.thisWeekViews, 8)} / 8`,
      done: personal.thisWeekViews >= 8
    },
    {
      title: "复习目标",
      detail: "先把待复习队列压到 12 道以内",
      progressText: personal.reviewQueue.length <= 12 ? `${personal.reviewQueue.length} 道` : `${personal.reviewQueue.length} / 12`,
      done: personal.reviewQueue.length <= 12
    }
  ];
  const milestones = [
    {
      title: "连续学习",
      unlocked: personal.currentStreak >= 3,
      description: personal.currentStreak >= 3 ? `已连续学习 ${personal.currentStreak} 天` : "连续学习满 3 天解锁"
    },
    {
      title: "掌握起步",
      unlocked: overview.masteredCount >= 10,
      description: overview.masteredCount >= 10 ? `已掌握 ${overview.masteredCount} 道题` : "掌握 10 道题解锁"
    },
    {
      title: "笔记习惯",
      unlocked: overview.noteCount >= 5,
      description: overview.noteCount >= 5 ? `已留下 ${overview.noteCount} 条笔记` : "留下 5 条笔记解锁"
    },
    {
      title: "长期跟踪",
      unlocked: personal.activeDays >= 7,
      description: personal.activeDays >= 7 ? `累计活跃 ${personal.activeDays} 天` : "累计活跃 7 天解锁"
    }
  ];

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        <div className="profile-stat-card">
          <Flame className="h-5 w-5 text-coral" />
          <strong>{personal.currentStreak}</strong>
          <span>连续学习天数</span>
        </div>
        <div className="profile-stat-card">
          <CalendarDays className="h-5 w-5 text-teal" />
          <strong>{personal.activeDays}</strong>
          <span>累计活跃天数</span>
        </div>
        <div className="profile-stat-card">
          <Gauge className="h-5 w-5 text-amber-strong" />
          <strong>{personal.reviewQueue.length}</strong>
          <span>当前待复习题</span>
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

      <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Gap Radar</p>
              <h2 className="mt-2 text-2xl font-black text-ink">现在哪些分类最值得补</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              按卡点强度排序
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {personal.categoryFocus.length > 0 ? (
              personal.categoryFocus.map((item) => (
                <div className="profile-focus-card" key={item.category}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong>{item.category}</strong>
                      <p>
                        已看 {item.viewed} / {item.total}，已掌握 {item.mastered}，其中 {item.reviewNeeded} 道已经形成明显回刷信号。
                      </p>
                    </div>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="profile-progress-track">
                    <div className="profile-progress-fill" style={{ width: `${Math.max(item.progress, 6)}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-ink/56">
                    {item.reviewNeeded > 0 ? (
                      <span className="mini-metric">
                        <Target className="h-3.5 w-3.5" />
                        待回刷 {item.reviewNeeded}
                      </span>
                    ) : null}
                    {item.favoriteCount > 0 ? (
                      <span className="mini-metric">
                        <Bookmark className="h-3.5 w-3.5" />
                        收藏 {item.favoriteCount}
                      </span>
                    ) : null}
                    <span className="mini-metric">
                      <Layers3 className="h-3.5 w-3.5" />
                      差距分 {item.gapScore}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                你刚开始用这个账号，分类短板还没长出来。等你多看几题，这里会明显告诉你哪条线只是“扫过”，还没真正补稳。
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Next Moves</p>
              <h2 className="mt-2 text-2xl font-black text-ink">下一轮怎么刷更划算</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {personal.categoryFocus.slice(0, 3).map((item, index) => (
              <div className="profile-summary-card" key={item.category}>
                <strong>动作 {index + 1} · {item.category}</strong>
                <p>
                  {item.reviewNeeded > 0
                    ? `这一类已经有 ${item.reviewNeeded} 道题出现回刷信号，适合先去复习模式把这条线往前推。`
                    : `这一类你已经看过 ${item.viewed} 道，但掌握只有 ${item.mastered} 道，最适合拿来做下一轮补缺。`}
                </p>
              </div>
            ))}
            <div className="profile-summary-card">
              <strong>动作 4 · 收敛收藏而不是继续堆</strong>
              <p>
                {personal.favorites.length > personal.notes.length
                  ? "你当前收藏比笔记多，下一轮更适合优先处理旧收藏，把其中最重要的题补一句自己的话。"
                  : "你已经开始用笔记沉淀，不要只继续加题，优先把有笔记但未掌握的题刷成稳定掌握。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Rhythm</p>
              <h2 className="mt-2 text-2xl font-black text-ink">最近 7 天学习节奏</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              本周浏览 {personal.thisWeekViews} 次
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="profile-rhythm-summary">
              <div className="profile-rhythm-badge">
                <Flame className="h-5 w-5 text-coral" />
                连学 {personal.currentStreak} 天
              </div>
              <p className="mt-4 text-3xl font-black leading-tight text-ink">{getRhythmLabel(personal.currentStreak)}</p>
              <p className="mt-3 text-sm leading-7 text-ink/62">
                最长连续学习 {personal.bestStreak} 天，累计活跃 {personal.activeDays} 天。只要不断档，个人中心就会越来越懂你下一步该学什么。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-7">
              {personal.recentActivity.map((day) => (
                <div className="profile-day-card" key={day.dateKey}>
                  <span className="profile-day-label">{day.shortLabel}</span>
                  <div className="profile-day-track">
                    <div
                      className="profile-day-fill"
                      style={{ height: `${Math.max(8, Math.round((day.views / maxRecentViews) * 100))}%` }}
                    />
                  </div>
                  <strong>{day.views}</strong>
                  <p>{day.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Coach</p>
            <h2 className="mt-2 text-2xl font-black text-ink">现在最值得做的三件事</h2>
          </div>

          <div className="mt-5 grid gap-3">
            {suggestions.map((item) => (
              <div className="profile-summary-card" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Calendar</p>
              <h2 className="mt-2 text-2xl font-black text-ink">最近 28 天学习日历</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              活跃 {personal.activeDays} 天
            </span>
          </div>

          <div className="mt-5">
            <div className="profile-calendar-grid">
              {personal.activityCalendar.map((day) => (
                <div className="profile-calendar-cell-wrap" key={day.dateKey}>
                  <div className={`profile-calendar-cell level-${day.level}`}>
                    <span className="sr-only">{`${day.label} 浏览 ${day.views} 次`}</span>
                  </div>
                  <p>{day.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-ink/52">
              <span>低</span>
              <div className="profile-calendar-legend">
                {[0, 1, 2, 3, 4].map((level) => (
                  <span className={`profile-calendar-cell level-${level as 0 | 1 | 2 | 3 | 4}`} key={level} />
                ))}
              </div>
              <span>高</span>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Routes</p>
              <h2 className="mt-2 text-2xl font-black text-ink">推进最快的路线</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              已进入 {personal.routeProgress.length} 条
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {personal.routeProgress.length > 0 ? (
              personal.routeProgress.map((route) => (
                <div className="profile-route-row" key={route.route}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 text-sm font-black text-ink">
                        <Layers3 className="h-4 w-4 text-teal" />
                        {route.route}
                      </div>
                      <p className="mt-2 text-xs font-bold text-ink/52">
                        已掌握 {route.mastered} / {route.total} · 看过 {route.viewed} 题 · 待补 {route.pending} 题
                      </p>
                    </div>
                    <strong className="text-lg font-black text-coral">{route.progress}%</strong>
                  </div>
                  <div className="profile-progress-track">
                    <div className="profile-progress-fill" style={{ width: `${Math.max(8, route.progress)}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                你还没形成明显的路线推进。等你在某个路线里连续看几道题，这里就会开始出现层次。
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Weak Spots</p>
              <h2 className="mt-2 text-2xl font-black text-ink">最近最容易忘的题</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              优先补短板
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {personal.hardestToRevisit.length > 0 ? (
              personal.hardestToRevisit.map((entry) => (
                <Link className="profile-queue-card" href={`/questions/${entry.question.slug}`} key={entry.question.slug}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <span className="status-chip">{entry.question.category}</span>
                        {(entry.view?.count ?? 0) >= 2 ? <span className="status-chip">反复看过</span> : null}
                        {entry.activity.notesByUser[currentUser]?.trim() ? <span className="status-chip">留过笔记</span> : null}
                      </div>
                      <h3 className="mt-3 text-lg font-black leading-snug text-ink">{entry.question.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-ink/60">
                        {entry.question.summary}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-smoke px-3 py-2 text-right">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/45">看过</p>
                      <p className="mt-1 text-2xl font-black text-coral">{entry.view?.count ?? 0}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                目前还没出现明显的反复卡壳题。等你在几道题上反复浏览或留笔记，这里会更像你的错点清单。
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Milestones</p>
            <h2 className="mt-2 text-2xl font-black text-ink">这一阶段你已经到哪了</h2>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="profile-summary-card">
              <strong>掌握进度</strong>
              <p>
                目前已经掌握 {overview.masteredCount} / {questions.length} 道题，整体推进到 {progress}%。
              </p>
            </div>
            <div className="profile-summary-card">
              <strong>复习压力</strong>
              <p>
                当前还有 {personal.reviewQueue.length} 道题进入了待回刷队列，其中真正明显卡过的题有 {personal.hardestToRevisit.length} 道。
              </p>
            </div>
            <div className="profile-summary-card">
              <strong>路线推进</strong>
              <p>
                {personal.routeProgress[0]
                  ? `现在推进最快的是「${personal.routeProgress[0].route}」，已经掌握 ${personal.routeProgress[0].mastered} / ${personal.routeProgress[0].total}。`
                  : "等你在一条路线里连续看过几道题，这里会开始出现明显的路线推进感。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Mastered</p>
              <h2 className="mt-2 text-2xl font-black text-ink">掌握清单重点回看</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              已掌握 {personal.mastered.length} 道
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {personal.mastered.length > 0 ? (
              personal.mastered
                .slice()
                .sort((left, right) => {
                  const leftAt = left.activity.viewedByUser[currentUser]?.lastViewedAt ?? "1970-01-01";
                  const rightAt = right.activity.viewedByUser[currentUser]?.lastViewedAt ?? "1970-01-01";
                  return Date.parse(rightAt) - Date.parse(leftAt);
                })
                .slice(0, 6)
                .map((entry) => (
                  <Link className="profile-list-card" href={`/questions/${entry.question.slug}`} key={entry.question.slug}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <span className="status-chip is-mastered">已掌握</span>
                          <span className="status-chip">{entry.question.category}</span>
                        </div>
                        <h3 className="mt-3 text-lg font-black leading-snug text-ink">{entry.question.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-ink/58">{entry.question.summary}</p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink/36" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-ink/56">
                      {entry.activity.viewedByUser[currentUser] ? (
                        <span className="mini-metric">
                          <Eye className="h-3.5 w-3.5" />
                          最近看于 {formatDate(entry.activity.viewedByUser[currentUser].lastViewedAt)}
                        </span>
                      ) : null}
                      {entry.activity.notesByUser[currentUser]?.trim() ? (
                        <span className="mini-metric">
                          <NotebookPen className="h-3.5 w-3.5" />
                          有巩固笔记
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                你还没有形成掌握清单。先把最熟的一道题标成掌握，后面这里就会开始变成你的巩固区。
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Momentum</p>
            <h2 className="mt-2 text-2xl font-black text-ink">这个阶段的推进感</h2>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="profile-summary-card">
              <strong>节奏稳定性</strong>
              <p>
                {personal.currentStreak >= 3
                  ? `你已经连续学习 ${personal.currentStreak} 天了，说明现在不是“偶尔刷”，而是在形成稳定节奏。`
                  : "现在还处在节奏刚起势的阶段，最关键的是把连续学习天数先拉起来。"}
              </p>
            </div>
            <div className="profile-summary-card">
              <strong>掌握和回刷的平衡</strong>
              <p>
                已掌握 {overview.masteredCount} 道，待回刷 {personal.reviewQueue.length} 道。最好的状态不是只会看新题，而是掌握清单和回刷清单都在一起往前走。
              </p>
            </div>
            <div className="profile-summary-card">
              <strong>下一步最划算的动作</strong>
              <p>
                {personal.hardestToRevisit[0]
                  ? `先补「${personal.hardestToRevisit[0].question.title}」这种明显卡过的题，再回头稳住你已经掌握的那几道。`
                  : "先把最近看过的一题真正标成掌握，再开始建立复习队列，会比只收藏更有效。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Goals</p>
              <h2 className="mt-2 text-2xl font-black text-ink">今日 / 本周目标</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              完成 {goals.filter((item) => item.done).length} / {goals.length}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {goals.map((goal) => (
              <div className={`profile-goal-card ${getGoalTone(goal.done)}`} key={goal.title}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong>{goal.title}</strong>
                    <p>{goal.detail}</p>
                  </div>
                  <span>{goal.progressText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Milestones</p>
              <h2 className="mt-2 text-2xl font-black text-ink">阶段里程碑</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              已解锁 {milestones.filter((item) => item.unlocked).length} 枚
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {milestones.map((item) => (
              <div className={`profile-milestone-card ${item.unlocked ? "is-unlocked" : ""}`} key={item.title}>
                <div className="flex items-center gap-3">
                  <div className="profile-milestone-icon">
                    {item.unlocked ? <Award className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                  </div>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
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
