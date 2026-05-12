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
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Target,
  UserRound
} from "lucide-react";

import { useStudy } from "@/components/study-provider";
import type { QuestionMeta } from "@/lib/content";
import type { ReviewSessionSummary } from "@/lib/study-store";
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

function getReviewSessionLaterHref(session: ReviewSessionSummary) {
  if (session.laterSlugs.length === 0) {
    return "/review";
  }

  return getSlugScopedReviewHref(session.laterSlugs);
}

function getSlugScopedReviewHref(slugs: string[], filter: ReviewSessionSummary["filter"] = "smart") {
  if (slugs.length === 0) {
    return "/review";
  }

  const params = new URLSearchParams();
  params.set("filter", filter);
  params.set("slugs", slugs.join(","));

  return `/review?${params.toString()}`;
}

function getNamedSlugScopedReviewHref(
  slugs: string[],
  bundleName: string,
  filter: ReviewSessionSummary["filter"] = "smart",
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

function sumReadingTime(entries: Array<{ question: QuestionMeta }>) {
  return entries.reduce((total, entry) => total + entry.question.readingTime, 0);
}

export function PersonalCenter({ questions }: PersonalCenterProps) {
  const { currentUser, data, getOverview, getReviewSessions, ready } = useStudy();
  const activeUser = currentUser ?? "";
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
  const reviewSessions = ready ? getReviewSessions() : [];
  const latestReviewSession = reviewSessions[0] ?? null;
  const latestLaterEntries =
    latestReviewSession?.laterSlugs.length && personal
      ? personal.entries
          .filter((entry) => latestReviewSession.laterSlugs.includes(entry.question.slug))
          .sort(
            (left, right) =>
              latestReviewSession.laterSlugs.indexOf(left.question.slug) -
              latestReviewSession.laterSlugs.indexOf(right.question.slug)
          )
      : [];
  const latestHardLaterEntries = latestLaterEntries.filter((entry) => {
    const viewCount = entry.activity.viewedByUser[activeUser]?.count ?? 0;

    return (
      viewCount >= 2 ||
      !!entry.activity.notesByUser[activeUser]?.trim() ||
      entry.activity.favoritedBy.includes(activeUser) ||
      !entry.activity.masteredBy.includes(activeUser)
    );
  });
  const latestSoftLaterEntries = latestLaterEntries.filter(
    (entry) => !latestHardLaterEntries.some((item) => item.question.slug === entry.question.slug)
  );
  const latestHardLaterWithNotes = latestHardLaterEntries.filter((entry) =>
    Boolean(entry.activity.notesByUser[activeUser]?.trim())
  );
  const latestHardLaterRepeatViewed = [...latestHardLaterEntries]
    .filter((entry) => (entry.activity.viewedByUser[activeUser]?.count ?? 0) >= 2)
    .sort(
      (left, right) =>
        (right.activity.viewedByUser[activeUser]?.count ?? 0) - (left.activity.viewedByUser[activeUser]?.count ?? 0)
    );
  const latestHardLaterUnmastered = latestHardLaterEntries.filter(
    (entry) => !entry.activity.masteredBy.includes(activeUser)
  );
  const latestHardLaterFavorite = latestHardLaterEntries.filter((entry) => entry.activity.favoritedBy.includes(activeUser));
  const cramBundle = personal
    ? personal.reviewQueue
        .filter((entry) => !entry.activity.masteredBy.includes(activeUser))
        .slice(0, 6)
    : [];
  const notesRecoveryBundle = personal
    ? personal.notes
        .filter((entry) => !entry.activity.masteredBy.includes(activeUser))
        .sort((left, right) => {
          const leftViews = left.activity.viewedByUser[activeUser]?.count ?? 0;
          const rightViews = right.activity.viewedByUser[activeUser]?.count ?? 0;
          return rightViews - leftViews;
        })
        .slice(0, 6)
    : [];
  const favoriteCleanupBundle = personal
    ? personal.favorites
        .filter((entry) => !entry.activity.masteredBy.includes(activeUser))
        .sort((left, right) => {
          const leftAt = left.activity.viewedByUser[activeUser]?.lastViewedAt ?? "1970-01-01";
          const rightAt = right.activity.viewedByUser[activeUser]?.lastViewedAt ?? "1970-01-01";
          return Date.parse(leftAt) - Date.parse(rightAt);
        })
        .slice(0, 6)
    : [];
  const recentRecoveryBundle = personal
    ? personal.history
        .filter((entry) => !entry.activity.masteredBy.includes(activeUser))
        .slice(0, 6)
    : [];
  const reheatingBundle = personal
    ? personal.mastered
        .filter((entry) => !!entry.activity.notesByUser[activeUser]?.trim() || (entry.activity.viewedByUser[activeUser]?.count ?? 0) >= 2)
        .sort((left, right) => {
          const leftAt = left.activity.viewedByUser[activeUser]?.lastViewedAt ?? "1970-01-01";
          const rightAt = right.activity.viewedByUser[activeUser]?.lastViewedAt ?? "1970-01-01";
          return Date.parse(rightAt) - Date.parse(leftAt);
        })
        .slice(0, 6)
    : [];
  const quickSprintBundle = personal
    ? personal.reviewQueue
        .filter((entry) => !entry.activity.masteredBy.includes(activeUser))
        .slice()
        .sort((left, right) => left.question.readingTime - right.question.readingTime)
        .slice(0, 4)
    : [];
  const weeklyFocusBundle = personal
    ? [...personal.categoryFocus]
        .sort((left, right) => right.gapScore - left.gapScore)
        .slice(0, 2)
        .flatMap((focus) =>
          personal.reviewQueue.filter((entry) => entry.question.category === focus.category).slice(0, 3)
        )
        .filter((entry, index, list) => list.findIndex((item) => item.question.slug === entry.question.slug) === index)
        .slice(0, 6)
    : [];
  const routeRecoveryBundle = personal
    ? personal.routeProgress[0]
      ? personal.reviewQueue.filter((entry) => entry.question.route === personal.routeProgress[0].route).slice(0, 5)
      : []
    : [];
  const assetBundles = [
    {
      title: "临考冲刺包",
      subtitle: "优先把最该回刷的题拎出来",
      description: "按当前复习队列最强信号直接组合，适合下一轮快速热手。",
      entries: cramBundle,
      href: getNamedSlugScopedReviewHref(cramBundle.map((entry) => entry.question.slug), "临考冲刺包"),
      icon: <Sparkles className="h-4 w-4" />,
      empty: "还没长出足够强的回刷信号，先去刷几题或留几条笔记。",
      meta: `约 ${sumReadingTime(cramBundle)} 分钟`
    },
    {
      title: "笔记回捞包",
      subtitle: "先处理你自己写过东西的题",
      description: "有笔记却还没掌握，通常就是最值得优先复盘的内容。",
      entries: notesRecoveryBundle,
      href: getNamedSlugScopedReviewHref(notesRecoveryBundle.map((entry) => entry.question.slug), "笔记回捞包"),
      icon: <NotebookPen className="h-4 w-4" />,
      empty: "还没有形成“有笔记但未吃透”的题包。",
      meta: `约 ${sumReadingTime(notesRecoveryBundle)} 分钟`
    },
    {
      title: "旧收藏清仓包",
      subtitle: "把收藏夹里堆久了的题收掉",
      description: "优先清掉收藏过但一直没彻底拿下的旧题，减少积压感。",
      entries: favoriteCleanupBundle,
      href: getNamedSlugScopedReviewHref(favoriteCleanupBundle.map((entry) => entry.question.slug), "旧收藏清仓包"),
      icon: <Bookmark className="h-4 w-4" />,
      empty: "现在没有需要优先清仓的旧收藏。",
      meta: `约 ${sumReadingTime(favoriteCleanupBundle)} 分钟`
    },
    {
      title: "最近回看包",
      subtitle: "从你刚碰过的题继续往下推",
      description: "适合在时间不长的时候直接续上最近浏览的那一批。",
      entries: recentRecoveryBundle,
      href: getNamedSlugScopedReviewHref(recentRecoveryBundle.map((entry) => entry.question.slug), "最近回看包"),
      icon: <Clock3 className="h-4 w-4" />,
      empty: "最近浏览里还没有形成未掌握的小题包。",
      meta: `约 ${sumReadingTime(recentRecoveryBundle)} 分钟`
    },
    {
      title: "回温巩固包",
      subtitle: "给已经掌握的题做一轮轻复盘",
      description: "有笔记或看过不止一次的掌握题，最适合偶尔回温，防止状态发虚。",
      entries: reheatingBundle,
      href: getNamedSlugScopedReviewHref(reheatingBundle.map((entry) => entry.question.slug), "回温巩固包"),
      icon: <BookMarked className="h-4 w-4" />,
      empty: "掌握题还不多，等你再沉淀几道，这里会更有价值。",
      meta: `约 ${sumReadingTime(reheatingBundle)} 分钟`
    },
    {
      title: "30 分钟快刷包",
      subtitle: "时间不多也能推进一轮",
      description: "优先挑阅读时间更短、但仍值得刷的题，适合碎片时间保持不断档。",
      entries: quickSprintBundle,
      href: getNamedSlugScopedReviewHref(quickSprintBundle.map((entry) => entry.question.slug), "30 分钟快刷包"),
      icon: <Clock3 className="h-4 w-4" />,
      empty: "当前还没有适合快刷的小题包。",
      meta: `约 ${sumReadingTime(quickSprintBundle)} 分钟`
    },
    {
      title: "本周重点包",
      subtitle: "先救最容易拖垮进度的分类",
      description: "从差距分最高的两类里抽出最值得回刷的题，适合拿来做本周止损。",
      entries: weeklyFocusBundle,
      href: getNamedSlugScopedReviewHref(weeklyFocusBundle.map((entry) => entry.question.slug), "本周重点包"),
      icon: <Target className="h-4 w-4" />,
      empty: "分类差距还不够明显，暂时不需要单开重点包。",
      meta: `约 ${sumReadingTime(weeklyFocusBundle)} 分钟`
    },
    {
      title: "路线止损包",
      subtitle: "别让主线推进只停在看过",
      description: "围绕你当前推进最快的路线，把还没真正吃透的题再拎一遍，避免路线虚高。",
      entries: routeRecoveryBundle,
      href: getNamedSlugScopedReviewHref(routeRecoveryBundle.map((entry) => entry.question.slug), "路线止损包"),
      icon: <Layers3 className="h-4 w-4" />,
      empty: "还没有形成明显的路线推进，不需要专门止损。",
      meta: `约 ${sumReadingTime(routeRecoveryBundle)} 分钟`
    }
  ];
  const latestBundleSession = reviewSessions.find((session) => !!session.bundleName) ?? null;
  const seenBundleNames = new Set(reviewSessions.map((session) => session.bundleName).filter(Boolean));
  const bundleNextMap: Record<string, string[]> = {
    临考冲刺包: ["本周重点包", "30 分钟快刷包", "回温巩固包"],
    笔记回捞包: ["临考冲刺包", "本周重点包", "回温巩固包"],
    旧收藏清仓包: ["笔记回捞包", "临考冲刺包", "路线止损包"],
    最近回看包: ["30 分钟快刷包", "临考冲刺包", "本周重点包"],
    回温巩固包: ["本周重点包", "路线止损包", "30 分钟快刷包"],
    "30 分钟快刷包": ["临考冲刺包", "本周重点包", "最近回看包"],
    本周重点包: ["临考冲刺包", "路线止损包", "回温巩固包"],
    路线止损包: ["本周重点包", "临考冲刺包", "回温巩固包"]
  };
  const rankedAssetBundles = assetBundles
    .map((bundle) => {
      const isLatestCompleted = bundle.title === latestBundleSession?.bundleName;
      const hasLaterCarry = isLatestCompleted && (latestBundleSession?.laterCount ?? 0) > 0;
      const isNewlySurfaced = bundle.entries.length > 0 && !seenBundleNames.has(bundle.title);
      const baseScore = bundle.entries.length * 10;
      const bonus =
        bundle.title === "本周重点包"
          ? 8
          : bundle.title === "临考冲刺包"
            ? 7
            : bundle.title === "路线止损包"
              ? 6
              : bundle.title === "30 分钟快刷包"
                ? 5
              : 0;
      const recencyPenalty = isLatestCompleted ? (hasLaterCarry ? 8 : 18) : 0;
      const lifecycle = hasLaterCarry
        ? {
            label: "还有尾巴",
            tone: "text-coral",
            summary: "这包刚刷完，但还有稍后题没真正收干净。",
            rank: 4
          }
        : isLatestCompleted
          ? {
              label: "刚完成",
              tone: "text-teal",
              summary: "刚推进过一轮，现在可以暂时往后放一点。",
              rank: 2
            }
          : isNewlySurfaced
            ? {
                label: "新出现",
                tone: "text-amber-strong",
                summary: "这是最近刚长出来、值得立刻看一眼的新任务包。",
                rank: 5
              }
            : bundle.entries.length > 0
              ? {
                  label: "值得接手",
                  tone: "text-ink",
                  summary: "已经形成稳定任务感，适合接到下一轮里处理。",
                  rank: 3
                }
              : {
                  label: "暂时空闲",
                  tone: "text-ink/45",
                  summary: "当前还没长出足够内容，先不用专门开这一包。",
                  rank: 1
                };

      return {
        ...bundle,
        isLatestCompleted,
        hasLaterCarry,
        isNewlySurfaced,
        lifecycle,
        score: baseScore + bonus - recencyPenalty,
        freshnessLabel: isLatestCompleted ? (hasLaterCarry ? "刚刷完 · 还留了稍后题" : "刚刷完 · 可先降优先级") : null
      };
    })
    .sort((left, right) => {
      if ((right.entries.length > 0 ? 1 : 0) !== (left.entries.length > 0 ? 1 : 0)) {
        return (right.entries.length > 0 ? 1 : 0) - (left.entries.length > 0 ? 1 : 0);
      }

      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.title.localeCompare(right.title, "zh-CN");
    });
  const bundleLookup = new Map(rankedAssetBundles.map((bundle) => [bundle.title, bundle]));
  const bundlesWithTransitions = rankedAssetBundles.map((bundle) => {
    const recommendedNextTitles = bundleNextMap[bundle.title] ?? [];
    const recommendedNext = recommendedNextTitles
      .map((title) => bundleLookup.get(title))
      .filter((item): item is (typeof rankedAssetBundles)[number] => item !== undefined && item.entries.length > 0);

    return {
      ...bundle,
      recommendedNext,
      nextHint:
        recommendedNext[0]?.title
          ? `通常下一步会接「${recommendedNext[0].title}」`
          : bundle.entries.length > 0
            ? "这包刷完后再回全量队列看新的优先级。"
            : "等这包重新长出内容，再决定下一步。"
    };
  });
  const latestBundlePath =
    latestBundleSession?.bundleName && latestBundleSession?.fromBundleName
      ? `${latestBundleSession.fromBundleName} -> ${latestBundleSession.bundleName}`
      : null;
  const recentBundleTransitions = reviewSessions
    .filter((session) => session.bundleName && session.fromBundleName)
    .slice(0, 4)
    .map((session) => ({
      id: session.id,
      path: `${session.fromBundleName} -> ${session.bundleName}`,
      finishedAt: session.finishedAt,
      completedCount: session.completedCount
    }));
  const bundleTransitionCounts = reviewSessions
    .filter((session) => session.bundleName && session.fromBundleName)
    .reduce<Record<string, number>>((map, session) => {
      const key = `${session.fromBundleName} -> ${session.bundleName}`;
      map[key] = (map[key] ?? 0) + 1;
      return map;
    }, {});
  const mostCommonBundlePath = Object.entries(bundleTransitionCounts).sort((left, right) => right[1] - left[1])[0] ?? null;
  const bundleStartCounts = reviewSessions
    .filter((session) => session.bundleName)
    .reduce<Record<string, number>>((map, session) => {
      const key = session.bundleName as string;
      map[key] = (map[key] ?? 0) + 1;
      return map;
    }, {});
  const mostUsedBundle = Object.entries(bundleStartCounts).sort((left, right) => right[1] - left[1])[0] ?? null;
  const heavyBundleNames = new Set(["本周重点包", "路线止损包", "临考冲刺包", "笔记回捞包"]);
  const lightBundleNames = new Set(["30 分钟快刷包", "最近回看包", "回温巩固包"]);
  const heavyBundleStarts = Object.entries(bundleStartCounts)
    .filter(([name]) => heavyBundleNames.has(name))
    .reduce((sum, [, count]) => sum + count, 0);
  const lightBundleStarts = Object.entries(bundleStartCounts)
    .filter(([name]) => lightBundleNames.has(name))
    .reduce((sum, [, count]) => sum + count, 0);
  const currentStreak = personal?.currentStreak ?? 0;
  const thisWeekViews = personal?.thisWeekViews ?? 0;
  const bundleLifecycleOverview = {
    active: bundlesWithTransitions.filter((bundle) => bundle.lifecycle.label === "值得接手").length,
    fresh: bundlesWithTransitions.filter((bundle) => bundle.lifecycle.label === "新出现").length,
    trailing: bundlesWithTransitions.filter((bundle) => bundle.lifecycle.label === "还有尾巴").length
  };
  const nextBundleSuggestions = bundlesWithTransitions.filter(
    (bundle) => bundle.entries.length > 0 && bundle.title !== latestBundleSession?.bundleName
  );
  const correctionNudges = [
    lightBundleStarts >= Math.max(2, heavyBundleStarts + 1) && nextBundleSuggestions.some((bundle) => heavyBundleNames.has(bundle.title))
      ? {
          title: "你最近有点偏轻量包",
          description: "快刷和最近回看很适合续节奏，但如果连续几轮都停在轻量包，真正该补的硬卡点会一直往后拖。",
          action: nextBundleSuggestions.find((bundle) => heavyBundleNames.has(bundle.title)) ?? null
        }
      : null,
    mostUsedBundle?.[0] === "30 分钟快刷包" && nextBundleSuggestions.some((bundle) => bundle.title === "本周重点包")
      ? {
          title: "别一直停在 30 分钟快刷",
          description: "你已经很会靠短包维持连续感了，下一步更值钱的是把本周重点真正吃进去一轮。",
          action: nextBundleSuggestions.find((bundle) => bundle.title === "本周重点包") ?? null
        }
      : null,
    mostUsedBundle?.[0] === "回温巩固包" && nextBundleSuggestions.some((bundle) => bundle.title === "临考冲刺包")
      ? {
          title: "巩固够了，可以开始上强度",
          description: "如果总在回温包里打转，会有一种在学的感觉，但真正的推进会变慢。",
          action: nextBundleSuggestions.find((bundle) => bundle.title === "临考冲刺包") ?? null
        }
      : null,
    bundleLifecycleOverview.trailing > 0 && nextBundleSuggestions.some((bundle) => bundle.title === "本轮稍后题回收" || bundle.title === "笔记回捞包")
      ? {
          title: "你现在最该做的是收尾，不是开新坑",
          description: "既然已经有包留下了尾巴，这一轮更适合先把稍后题和笔记卡点收回来。",
          action:
            nextBundleSuggestions.find((bundle) => bundle.title === "本轮稍后题回收") ??
            nextBundleSuggestions.find((bundle) => bundle.title === "笔记回捞包") ??
            null
        }
      : null
  ].filter(
    (
      item
    ): item is { title: string; description: string; action: (typeof nextBundleSuggestions)[number] | null } => Boolean(item)
  );
  const intensityRecommendation =
    bundleLifecycleOverview.trailing > 0
        ? {
            level: "先降一点强度",
            tone: "text-coral",
            description: "现在最值钱的不是继续加题，而是先把尾巴收掉，别让稍后题越滚越多。",
          action:
            nextBundleSuggestions.find((bundle) => bundle.title === "笔记回捞包") ??
            nextBundleSuggestions.find((bundle) => bundle.title === "本轮稍后题回收") ??
            nextBundleSuggestions[0] ??
            null
        }
      : currentStreak >= 3 &&
          thisWeekViews >= 8 &&
          heavyBundleStarts <= lightBundleStarts &&
          nextBundleSuggestions.some((bundle) => heavyBundleNames.has(bundle.title))
        ? {
            level: "可以提一点强度",
            tone: "text-teal",
            description: "你的连续性已经起来了，说明现在有余力把轻量包往更硬的题包推进一格。",
            action: nextBundleSuggestions.find((bundle) => heavyBundleNames.has(bundle.title)) ?? null
          }
        : currentStreak >= 2 || thisWeekViews >= 5
          ? {
              level: "先稳住当前强度",
              tone: "text-ink",
              description: "节奏正在形成，现在最重要的是别断。继续接一包能稳定推进的题，比突然上强度更划算。",
              action:
                nextBundleSuggestions.find((bundle) => bundle.title === "30 分钟快刷包") ??
                nextBundleSuggestions[0] ??
                null
            }
          : {
              level: "先把强度降到能连续",
              tone: "text-amber-strong",
              description: "当前更需要的是把学习频率拉起来，不需要一上来就啃最重的包，先把连续几天做出来。",
              action:
                nextBundleSuggestions.find((bundle) => bundle.title === "30 分钟快刷包") ??
                nextBundleSuggestions.find((bundle) => bundle.title === "最近回看包") ??
                nextBundleSuggestions[0] ??
                null
            };

  if (!ready) {
    return (
      <section className="rounded-[2rem] border border-white/75 bg-white/68 p-8 shadow-soft backdrop-blur-2xl">
        <p className="text-lg font-semibold text-ink">正在整理你的学习轨迹...</p>
      </section>
    );
  }

  if (!currentUser || !personal) {
    return (
      <section className="profile-hero rounded-[2rem] border border-ink/10 p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.6rem] border border-white/80 bg-white/82 text-teal shadow-soft">
            <UserRound className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-teal">Personal Center</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">把你的学习轨迹收回来。</h1>
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
          description: `优先把「${personal.reviewQueue[0].question.title}」过一遍，它现在排在你的复习队列最前面。`,
          href: `/questions/${personal.reviewQueue[0].question.slug}`,
          cta: "先看这道题"
        }
      : null,
    overview.noteCount < Math.max(2, overview.totalFavorites)
      ? {
          title: "收藏不少，笔记还偏少",
          description: "下一轮不要只收藏，至少给最容易忘的两道题各写一句自己的话。",
          href: "/review?filter=favorites",
          cta: "先收旧收藏"
        }
      : {
          title: "笔记沉淀已经开始起作用",
          description: "你已经不只是点收藏了，接下来适合把有笔记但未掌握的题重点回刷。",
          href: "/review?filter=notes",
          cta: "先刷笔记题"
        },
    personal.currentStreak >= 3
      ? {
          title: "别断掉这波连学",
          description: `你已经连续学了 ${personal.currentStreak} 天，今天哪怕只过一题，也比断档值钱。`,
          href: "/review",
          cta: "续上今天这一轮"
        }
      : {
          title: "把节奏先连起来",
          description: "连续 3 天哪怕每天只看 1 题，个人中心的数据就会开始明显变得有判断力。",
          href: personal.nextContinue ? `/questions/${personal.nextContinue.question.slug}` : "/review",
          cta: "先开今天第一题"
        }
  ].filter((item): item is { title: string; description: string; href: string; cta: string } => !!item);
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
  const immediateActionCards = [
    personal.nextContinue
      ? {
          title: "先续上刚停下来的题",
          detail: `从「${personal.nextContinue.question.title}」接着往下最省脑力，别让刚有的手感冷掉。`,
          href: `/questions/${personal.nextContinue.question.slug}`,
          cta: "继续这道题"
        }
      : null,
    cramBundle.length > 0
      ? {
          title: "开一轮临考冲刺包",
          detail: `这 ${cramBundle.length} 道已经是当前最值得优先回刷的题，适合马上进入状态。`,
          href: getNamedSlugScopedReviewHref(cramBundle.map((entry) => entry.question.slug), "临考冲刺包"),
          cta: "开始冲刺包"
        }
      : null,
    weeklyFocusBundle.length > 0
      ? {
          title: "先救本周最拖后腿的分类",
          detail: `优先处理「${weeklyFocusBundle[0].question.category}」这类，最容易把整周节奏拉回来。`,
          href: getNamedSlugScopedReviewHref(weeklyFocusBundle.map((entry) => entry.question.slug), "本周重点包"),
          cta: "先补这类"
        }
      : null,
    latestHardLaterEntries.length > 0
      ? {
          title: "收掉上轮留下的卡点",
          detail: `你上轮还有 ${latestHardLaterEntries.length} 道明显卡壳题没收，先清这批最划算。`,
          href: getSlugScopedReviewHref(latestHardLaterEntries.map((entry) => entry.question.slug)),
          cta: "回收卡壳题"
        }
      : null
  ].filter(
    (item): item is { title: string; detail: string; href: string; cta: string } => Boolean(item)
  );

  return (
    <div className="space-y-6">
      <section className="profile-hero rounded-[2rem] border border-ink/10 p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/68 px-3 py-1 text-sm font-semibold text-ink backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-teal" />
              个人中心 · 数据库学习工作台
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-[1.6rem] border border-white/80 bg-white/82 text-2xl font-semibold text-teal shadow-soft">
                {currentUser.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal">Welcome Back</p>
                <h1 className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-ink sm:text-5xl">{currentUser}</h1>
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

          <div className="rounded-[1.6rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl">
            <p className="text-sm font-medium text-ink/55">当前学习状态</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[1.15rem] border border-white/75 bg-white/76 p-4">
                <p className="text-3xl font-semibold text-teal">{overview.masteredCount}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">已掌握</p>
              </div>
              <div className="rounded-[1.15rem] border border-white/75 bg-white/76 p-4">
                <p className="text-3xl font-semibold text-[#3478f6]">{questions.length - overview.masteredCount}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">待补</p>
              </div>
              <div className="rounded-[1.15rem] border border-white/75 bg-white/76 p-4">
                <p className="text-3xl font-semibold text-ink">{overview.totalViews}</p>
                <p className="mt-1 text-sm font-bold text-ink/55">累计浏览</p>
              </div>
              <div className="rounded-[1.15rem] border border-white/75 bg-white/76 p-4">
                <p className="text-3xl font-semibold text-ink">{progress}%</p>
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

      <section className="rounded-[1.8rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Today Plan</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">今天先做这些，最容易进入状态</h2>
            <p className="mt-2 text-sm leading-7 text-ink/58">
              别先自己想半天学什么。直接从这里挑一个动作开始，个人中心会比你自己硬排更快把人带进学习状态。
            </p>
          </div>
          <span className="rounded-full border border-white/75 bg-white/76 px-3 py-1 text-sm font-medium text-ink/55">
            推荐 {Math.min(immediateActionCards.length, 4)} 个动作
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
          {immediateActionCards.map((item) => (
            <div className="profile-summary-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
              <div className="mt-4">
                <Link className="ghost-action" href={item.href}>
                  <ArrowRight className="h-4 w-4" />
                  {item.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.8rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Continue</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">继续学下去</h2>
            </div>
            <span className="rounded-full border border-white/75 bg-white/76 px-3 py-1 text-sm font-medium text-ink/55">
              已跟踪 {personal.totalTracked} 道
            </span>
          </div>

          {personal.nextContinue ? (
            <Link className="profile-continue-card mt-5 block" href={`/questions/${personal.nextContinue.question.slug}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-teal">{personal.nextContinue.question.category}</p>
                  <h3 className="mt-2 text-2xl font-semibold leading-snug tracking-[-0.03em] text-ink">
                    {personal.nextContinue.question.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/62">
                    {personal.nextContinue.activity.masteredBy.includes(currentUser)
                      ? "这题你已经标成掌握，可以顺手回看一下笔记和评论，查缺补漏。"
                      : "这是你最近碰过但还没掌握的题，直接从这里续上最顺手。"}
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[1.15rem] border border-white/80 bg-white/84 text-teal shadow-[0_10px_28px_rgba(15,23,40,0.08)]">
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      className="ghost-action"
                      href={`/review?filter=smart&category=${encodeURIComponent(item.category)}`}
                    >
                      <GraduationCap className="h-4 w-4" />
                      只刷这类
                    </Link>
                    <Link
                      className="ghost-action"
                      href={`/review?filter=pending&category=${encodeURIComponent(item.category)}`}
                    >
                      <Target className="h-4 w-4" />
                      先清未掌握
                    </Link>
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

        <div className="rounded-[1.8rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Next Moves</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">下一轮怎么刷更划算</h2>
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
                <div className="mt-3">
                  <Link
                    className="ghost-action"
                    href={`/review?filter=smart&category=${encodeURIComponent(item.category)}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                    直接按这类开刷
                  </Link>
                </div>
              </div>
            ))}
            <div className="profile-summary-card">
              <strong>动作 4 · 收敛收藏而不是继续堆</strong>
              <p>
                {personal.favorites.length > personal.notes.length
                  ? "你当前收藏比笔记多，下一轮更适合优先处理旧收藏，把其中最重要的题补一句自己的话。"
                  : "你已经开始用笔记沉淀，不要只继续加题，优先把有笔记但未掌握的题刷成稳定掌握。"}
              </p>
              <div className="mt-3">
                <Link className="ghost-action" href={personal.favorites.length > personal.notes.length ? "/review?filter=favorites" : "/review?filter=notes"}>
                  <ArrowRight className="h-4 w-4" />
                  {personal.favorites.length > personal.notes.length ? "先收收藏题" : "先刷笔记题"}
                </Link>
              </div>
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

        <div className="rounded-[1.8rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Coach</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">现在最值得做的三件事</h2>
          </div>

          <div className="mt-5 grid gap-3">
            {suggestions.map((item) => (
              <div className="profile-summary-card" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <div className="mt-3">
                  <Link className="ghost-action" href={item.href}>
                    <ArrowRight className="h-4 w-4" />
                    {item.cta}
                  </Link>
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
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">路线推进</p>
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      className="ghost-action"
                      href={`/review?filter=smart&route=${encodeURIComponent(route.route)}`}
                    >
                      <GraduationCap className="h-4 w-4" />
                      顺着这条路线刷
                    </Link>
                    <Link
                      className="ghost-action"
                      href={`/review?filter=pending&route=${encodeURIComponent(route.route)}`}
                    >
                      <Target className="h-4 w-4" />
                      只看未掌握
                    </Link>
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
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">稍后回收</p>
              <h2 className="mt-2 text-2xl font-black text-ink">上轮稍后题清单</h2>
            </div>
            <span className="rounded-full bg-smoke px-3 py-1 text-sm font-bold text-ink/55">
              {latestLaterEntries.length} 道
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {latestLaterEntries.length > 0 && latestReviewSession ? (
              <>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="profile-later-group is-hard">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <strong>先处理这批明显卡壳题</strong>
                        <p>反复看过、留过笔记、收藏过或还没掌握的题，优先收。</p>
                      </div>
                      <span>{latestHardLaterEntries.length} 道</span>
                    </div>
                    <div className="mt-3 space-y-3">
                      {latestHardLaterEntries.slice(0, 3).map((entry) => (
                        <Link className="profile-later-pick-card" href={`/questions/${entry.question.slug}`} key={entry.question.slug}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap gap-2">
                                <span className="status-chip">{entry.question.category}</span>
                                {(entry.activity.viewedByUser[currentUser]?.count ?? 0) >= 2 ? (
                                  <span className="status-chip">反复看过</span>
                                ) : null}
                                {entry.activity.notesByUser[currentUser]?.trim() ? (
                                  <span className="status-chip">留过笔记</span>
                                ) : null}
                                {!entry.activity.masteredBy.includes(currentUser) ? (
                                  <span className="status-chip">还没掌握</span>
                                ) : null}
                              </div>
                              <h3 className="mt-3 text-lg font-black leading-snug text-ink">{entry.question.title}</h3>
                              <p className="mt-2 text-sm leading-7 text-ink/60">{entry.question.summary}</p>
                            </div>
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink/36" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="profile-later-group">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <strong>这一批更像暂时放一放</strong>
                        <p>不是明显卡壳，只是上一轮当时先略过了。</p>
                      </div>
                      <span>{latestSoftLaterEntries.length} 道</span>
                    </div>
                    <div className="mt-3 space-y-3">
                      {latestSoftLaterEntries.length > 0 ? (
                        latestSoftLaterEntries.slice(0, 3).map((entry) => (
                          <Link className="profile-later-pick-card" href={`/questions/${entry.question.slug}`} key={entry.question.slug}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap gap-2">
                                  <span className="status-chip">{entry.question.category}</span>
                                  <span className="status-chip">暂缓处理</span>
                                </div>
                                <h3 className="mt-3 text-lg font-black leading-snug text-ink">{entry.question.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-ink/60">{entry.question.summary}</p>
                              </div>
                              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink/36" />
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="rounded-[1.2rem] bg-white px-4 py-5 text-sm font-bold leading-7 text-ink/55">
                          这一轮稍后题里，几乎都已经属于需要优先收掉的卡点。
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {latestHardLaterEntries.length > 0 ? (
                    <Link className="primary-action" href={getSlugScopedReviewHref(latestHardLaterEntries.map((entry) => entry.question.slug))}>
                      <Sparkles className="h-4 w-4" />
                      只收明显卡壳题
                    </Link>
                  ) : null}
                  {latestHardLaterWithNotes.length > 0 ? (
                    <Link
                      className="ghost-action"
                      href={getSlugScopedReviewHref(latestHardLaterWithNotes.map((entry) => entry.question.slug))}
                    >
                      <NotebookPen className="h-4 w-4" />
                      先收有笔记卡点
                    </Link>
                  ) : null}
                  {latestHardLaterRepeatViewed.length > 0 ? (
                    <Link
                      className="ghost-action"
                      href={getSlugScopedReviewHref(latestHardLaterRepeatViewed.map((entry) => entry.question.slug))}
                    >
                      <Eye className="h-4 w-4" />
                      按反复浏览优先
                    </Link>
                  ) : null}
                  {latestHardLaterUnmastered.length > 0 ? (
                    <Link
                      className="ghost-action"
                      href={getSlugScopedReviewHref(latestHardLaterUnmastered.map((entry) => entry.question.slug))}
                    >
                      <BookMarked className="h-4 w-4" />
                      先收还没掌握的
                    </Link>
                  ) : null}
                  {latestHardLaterFavorite.length > 0 ? (
                    <Link
                      className="ghost-action"
                      href={getSlugScopedReviewHref(latestHardLaterFavorite.map((entry) => entry.question.slug))}
                    >
                      <Bookmark className="h-4 w-4" />
                      先收你收藏过的
                    </Link>
                  ) : null}
                  <Link className="primary-action" href={getReviewSessionLaterHref(latestReviewSession)}>
                    <Clock3 className="h-4 w-4" />
                    优先收整批稍后题
                  </Link>
                  <Link className="ghost-action" href={getReviewSessionHref(latestReviewSession)}>
                    <GraduationCap className="h-4 w-4" />
                    再开同范围一轮
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                你最近还没有把题主动挪到“稍后再看”。等下一轮遇到想先跳过的卡点，这里就会自动长成你的专项回收入口。
              </div>
            )}
          </div>
        </div>

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
        <div className="rounded-[1.8rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Review Recap</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">最近完成的复习轮次</h2>
            </div>
            <span className="rounded-full border border-white/75 bg-white/76 px-3 py-1 text-sm font-medium text-ink/55">
              最近 {Math.min(reviewSessions.length, 3)} 轮
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {reviewSessions.length > 0 ? (
              reviewSessions.slice(0, 3).map((session) => (
                <div className="profile-review-session-card" key={session.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong>{session.category ?? session.route ?? "全局复习"}</strong>
                      <p>
                        完成 {session.completedCount} 题，其中掌握 {session.masteredCount} 题，另有 {session.laterCount} 题留到稍后。
                      </p>
                    </div>
                    <span>{formatDate(session.finishedAt)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="status-chip">模式：{session.filter}</span>
                    {session.fromBundleName ? <span className="status-chip">来自：{session.fromBundleName}</span> : null}
                    {session.bundleName ? <span className="status-chip">题包：{session.bundleName}</span> : null}
                    {session.laterSlugs.length > 0 ? <span className="status-chip">稍后 {session.laterSlugs.length} 题</span> : null}
                    {session.categories.map((item) => (
                      <span className="status-chip" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link className="ghost-action" href={getReviewSessionHref(session)}>
                      <GraduationCap className="h-4 w-4" />
                      再开同范围一轮
                    </Link>
                    {session.laterSlugs.length > 0 ? (
                      <Link className="ghost-action" href={getReviewSessionLaterHref(session)}>
                        <Clock3 className="h-4 w-4" />
                        优先收上轮稍后题
                      </Link>
                    ) : null}
                    <Link className="ghost-action" href="/review">
                      <ArrowRight className="h-4 w-4" />
                      回全量复习模式
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-smoke px-5 py-8 text-sm font-bold leading-7 text-ink/55">
                你还没有完整收住一轮复习。等你在复习模式里刷空一轮，这里会自动记下你当时推进了哪条线。
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Goals</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">今日 / 本周目标</h2>
            </div>
            <span className="rounded-full border border-white/75 bg-white/76 px-3 py-1 text-sm font-medium text-ink/55">
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
        <div className="rounded-[1.8rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">回刷队列</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">现在最值得回刷的题</h2>
            </div>
            <span className="rounded-full border border-white/75 bg-white/76 px-3 py-1 text-sm font-medium text-ink/55">
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
                    <div className="rounded-[1rem] border border-white/75 bg-white/82 px-3 py-2 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/45">优先级</p>
                      <p className="mt-1 text-2xl font-semibold text-teal">{entry.priority}</p>
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

        <div className="rounded-[1.8rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Snapshot</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">这一段学习像什么</h2>
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
        <div className="rounded-[1.8rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">History</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">浏览记录</h2>
            </div>
            <span className="rounded-full border border-white/75 bg-white/76 px-3 py-1 text-sm font-medium text-ink/55">
              最近 {Math.min(personal.history.length, 8)} 条
            </span>
          </div>

          <div className="mt-4 rounded-[1.15rem] border border-white/75 bg-white/76 px-4 py-3 text-sm text-ink/60">
            最近看过的题最适合拿来续手感。别从零重新选，直接从这里接着往下看通常最快进入状态。
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

          {personal.history.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <Link className="ghost-action" href={`/questions/${personal.history[0].question.slug}`}>
                <ArrowRight className="h-4 w-4" />
                继续最近那题
              </Link>
              <Link className="ghost-action" href="/review?filter=recent">
                <Clock3 className="h-4 w-4" />
                按最近浏览开刷
              </Link>
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.8rem] border border-white/75 bg-white/68 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Collection</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">收藏 / 点赞 / 掌握</h2>
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

          <div className="mt-5 flex flex-wrap gap-2">
            {personal.favorites.length > 0 ? (
              <Link className="ghost-action" href="/review?filter=favorites">
                <Bookmark className="h-4 w-4" />
                先收收藏题
              </Link>
            ) : null}
            {personal.mastered.length > 0 ? (
              <Link className="ghost-action" href={`/questions/${personal.mastered[0].question.slug}`}>
                <BookMarked className="h-4 w-4" />
                回看一题掌握题
              </Link>
            ) : null}
            {personal.likes.length > 0 ? (
              <Link className="ghost-action" href={`/questions/${personal.likes[0].question.slug}`}>
                <Heart className="h-4 w-4" />
                回到点赞最多的入口
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Bundles</p>
            <h2 className="mt-2 text-2xl font-black text-ink">帮你整理好的复习题包</h2>
            <p className="mt-2 text-sm leading-7 text-ink/58">
              不用自己从浏览、收藏、笔记里再手动挑。这里直接把不同学习意图编成题包，点进去就是一轮。
            </p>
          </div>
          <Link className="ghost-action" href="/review">
            <GraduationCap className="h-4 w-4" />
            回全量复习模式
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
          <span className="status-chip">新出现 {bundleLifecycleOverview.fresh}</span>
          <span className="status-chip">值得接手 {bundleLifecycleOverview.active}</span>
          <span className="status-chip">还有尾巴 {bundleLifecycleOverview.trailing}</span>
        </div>

        {latestBundleSession ? (
          <div className="mt-5 rounded-[1.4rem] border border-ink/10 bg-smoke/55 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-coral">Latest Bundle</p>
                <h3 className="mt-2 text-xl font-black text-ink">你刚清掉了「{latestBundleSession.bundleName}」</h3>
                <p className="mt-2 text-sm leading-7 text-ink/60">
                  最近一轮一共推进了 {latestBundleSession.completedCount} 道题，
                  {latestBundleSession.laterCount > 0
                    ? `还有 ${latestBundleSession.laterCount} 道先放到了稍后。`
                    : "这轮没有留下稍后题，收得很干净。"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="ghost-action" href={getReviewSessionHref(latestBundleSession)}>
                  <RotateCcw className="h-4 w-4" />
                  再刷这一包
                </Link>
                {latestBundleSession.laterSlugs.length > 0 ? (
                  <Link className="ghost-action" href={getReviewSessionLaterHref(latestBundleSession)}>
                    <Clock3 className="h-4 w-4" />
                    继续收稍后题
                  </Link>
                ) : null}
              </div>
            </div>

            {nextBundleSuggestions.length > 0 ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {nextBundleSuggestions.slice(0, 3).map((bundle) => (
                  <div className="review-completed-card" key={`next-${bundle.title}`}>
                    <strong className="text-base font-black text-ink">{bundle.title}</strong>
                    <p className="mt-2 text-sm leading-7 text-ink/60">{bundle.description}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-ink/45">{bundle.meta}</span>
                      <Link
                        className="ghost-action"
                        href={getNamedSlugScopedReviewHref(
                          bundle.entries.map((entry) => entry.question.slug),
                          bundle.title,
                          "smart",
                          latestBundleSession.bundleName ?? null
                        )}
                      >
                        <Sparkles className="h-4 w-4" />
                        开始这一包
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {latestBundlePath ? (
          <div className="mt-4 rounded-[1.1rem] bg-smoke px-4 py-4 text-sm font-bold text-ink/62">
            最近一次任务衔接：{latestBundlePath}
          </div>
        ) : null}

        {recentBundleTransitions.length > 0 ? (
          <div className="mt-4 rounded-[1.4rem] border border-ink/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-coral">最近节奏</p>
                <h3 className="mt-2 text-lg font-black text-ink">最近几次你是怎么接着刷的</h3>
              </div>
              <span className="rounded-full bg-smoke px-3 py-1 text-xs font-black text-ink/55">
                最近 {recentBundleTransitions.length} 次
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink/60">这块会帮你看清自己最近最常从哪一类题包起手，又会顺着什么节奏往下推。</p>

            {(mostCommonBundlePath || mostUsedBundle) ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {mostCommonBundlePath ? (
                  <div className="review-completed-card">
                    <strong className="text-base font-black text-ink">你最常见的接法</strong>
                    <p className="mt-2 text-sm leading-7 text-ink/60">
                      目前最常出现的是「{mostCommonBundlePath[0]}」，已经发生了 {mostCommonBundlePath[1]} 次。
                    </p>
                  </div>
                ) : null}
                {mostUsedBundle ? (
                  <div className="review-completed-card">
                    <strong className="text-base font-black text-ink">你最常开的题包</strong>
                    <p className="mt-2 text-sm leading-7 text-ink/60">
                      目前你最常从「{mostUsedBundle[0]}」起手，一共开过 {mostUsedBundle[1]} 次。
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {recentBundleTransitions.map((item) => (
                <div className="review-completed-card" key={item.id}>
                  <strong className="text-base font-black text-ink">{item.path}</strong>
                  <p className="mt-2 text-sm leading-7 text-ink/60">
                    当时这一跳一共推进了 {item.completedCount} 道题，完成于 {formatDate(item.finishedAt)}。
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {correctionNudges.length > 0 ? (
          <div className="mt-4 rounded-[1.4rem] border border-ink/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-coral">纠偏提醒</p>
                <h3 className="mt-2 text-lg font-black text-ink">系统觉得你现在该稍微纠偏一下</h3>
              </div>
              <span className="rounded-full bg-smoke px-3 py-1 text-xs font-black text-ink/55">
                {correctionNudges.length} 条提醒
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink/60">如果某一类题开始堆积，或者你最近总在绕路，这里会直接提醒你先救哪里最划算。</p>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {correctionNudges.map((item) => (
                <div className="review-completed-card" key={item.title}>
                  <strong className="text-base font-black text-ink">{item.title}</strong>
                  <p className="mt-2 text-sm leading-7 text-ink/60">{item.description}</p>
                  {item.action ? (
                    <div className="mt-4">
                      <Link className="ghost-action" href={item.action.href}>
                        <Target className="h-4 w-4" />
                        开始 {item.action.title}
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-[1.4rem] border border-ink/10 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-coral">强度建议</p>
              <h3 className="mt-2 text-lg font-black text-ink">系统觉得你这周该怎么控强度</h3>
            </div>
            <span className={`rounded-full bg-smoke px-3 py-1 text-xs font-black ${intensityRecommendation.tone}`}>
              {intensityRecommendation.level}
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-ink/60">{intensityRecommendation.description}</p>

          {intensityRecommendation.action ? (
            <div className="mt-4">
              <Link className="ghost-action" href={intensityRecommendation.action.href}>
                <Sparkles className="h-4 w-4" />
                按这个强度开始 {intensityRecommendation.action.title}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {bundlesWithTransitions.map((bundle) => (
            <div className="rounded-[1.4rem] border border-ink/10 bg-smoke/45 p-4" key={bundle.title}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-ink/72">
                    {bundle.icon}
                    {bundle.subtitle}
                  </div>
                  <h3 className="mt-3 text-xl font-black text-ink">{bundle.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink/58">{bundle.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-ink/55">{bundle.entries.length} 题</span>
                  {bundle.entries.length > 0 ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ink/45">{bundle.meta}</span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className={`inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black ${bundle.lifecycle.tone}`}>
                  <Sparkles className="h-3.5 w-3.5" />
                  {bundle.lifecycle.label}
                </div>
                {bundle.freshnessLabel ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-coral">
                    <Sparkles className="h-3.5 w-3.5" />
                    {bundle.freshnessLabel}
                  </div>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-7 text-ink/56">{bundle.lifecycle.summary}</p>
              <p className="mt-2 text-sm font-bold text-ink/48">{bundle.nextHint}</p>

              {bundle.recommendedNext.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {bundle.recommendedNext.slice(0, 2).map((nextBundle) => (
                    <Link
                      className="ghost-action"
                      href={getNamedSlugScopedReviewHref(
                        nextBundle.entries.map((entry) => entry.question.slug),
                        nextBundle.title,
                        "smart",
                        bundle.title
                      )}
                      key={`${bundle.title}-to-${nextBundle.title}`}
                    >
                      <ArrowRight className="h-4 w-4" />
                      开始 {nextBundle.title}
                    </Link>
                  ))}
                </div>
              ) : null}

              {bundle.entries.length > 0 ? (
                <>
                  <div className="mt-4 space-y-2">
                    {bundle.entries.slice(0, 3).map((entry) => (
                      <Link className="profile-mini-link" href={`/questions/${entry.question.slug}`} key={`${bundle.title}-${entry.question.slug}`}>
                        {entry.question.title}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link className="primary-action" href={bundle.href}>
                      <ArrowRight className="h-4 w-4" />
                      开始这一包
                    </Link>
                    <Link className="ghost-action" href={`/questions/${bundle.entries[0].question.slug}`}>
                      <Eye className="h-4 w-4" />
                      先看这道题
                    </Link>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-[1.1rem] bg-white px-4 py-5 text-sm font-bold leading-7 text-ink/55">
                  {bundle.empty}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">学习资产</p>
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
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">笔记沉淀</p>
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
                你还没写笔记。建议先从最容易讲混的题开始，每题只记一句“我真正会忘什么”，这里很快就会变成你的复习捷径。
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">讨论记录</p>
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
                讨论区还没留下你的痕迹。后面碰到卡壳的题，可以直接把“我总和哪个知识点混”“这题还能怎么追问”这种问题丢进去。
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
