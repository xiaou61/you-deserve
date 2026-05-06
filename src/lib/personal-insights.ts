import type { QuestionMeta } from "@/lib/content";
import {
  getQuestionActivity,
  type QuestionActivity,
  type QuestionViewRecord,
  type StudyComment,
  type StudyStoreData
} from "@/lib/study-store";

export type PersonalEntry = {
  question: QuestionMeta;
  activity: QuestionActivity;
};

export type PersonalHistoryEntry = PersonalEntry & {
  view: QuestionViewRecord;
};

export type PersonalNoteEntry = PersonalEntry & {
  note: string;
};

export type PersonalCommentEntry = {
  comment: StudyComment;
  question: QuestionMeta;
};

export type ReviewQueueEntry = PersonalEntry & {
  priority: number;
  reasons: string[];
  view: QuestionViewRecord | null;
};

export type ActivityDay = {
  dateKey: string;
  label: string;
  shortLabel: string;
  views: number;
  questionCount: number;
};

export type ActivityCalendarDay = ActivityDay & {
  level: 0 | 1 | 2 | 3 | 4;
};

export type RouteProgress = {
  route: string;
  total: number;
  mastered: number;
  viewed: number;
  pending: number;
  progress: number;
};

export type CategoryFocus = {
  category: string;
  total: number;
  viewed: number;
  mastered: number;
  reviewNeeded: number;
  favoriteCount: number;
  progress: number;
  gapScore: number;
};

export type PersonalInsights = {
  entries: PersonalEntry[];
  history: PersonalHistoryEntry[];
  favorites: PersonalEntry[];
  likes: PersonalEntry[];
  mastered: PersonalEntry[];
  notes: PersonalNoteEntry[];
  comments: PersonalCommentEntry[];
  hottestCategories: Array<[string, number]>;
  latestVisit: string | null;
  nextContinue: PersonalHistoryEntry | null;
  totalTracked: number;
  reviewQueue: ReviewQueueEntry[];
  activeDays: number;
  currentStreak: number;
  bestStreak: number;
  thisWeekViews: number;
  recentActivity: ActivityDay[];
  activityCalendar: ActivityCalendarDay[];
  routeProgress: RouteProgress[];
  categoryFocus: CategoryFocus[];
  hardestToRevisit: ReviewQueueEntry[];
  pendingCount: number;
};

function toDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toDateOnly(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`);
}

function formatActivityLabel(dateKey: string) {
  const date = toDateOnly(dateKey);

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric"
  }).format(date);
}

function formatActivityShortLabel(dateKey: string) {
  const date = toDateOnly(dateKey);

  return new Intl.DateTimeFormat("zh-CN", {
    weekday: "short"
  }).format(date);
}

function diffDays(left: string, right: string) {
  const leftTime = toDateOnly(left).getTime();
  const rightTime = toDateOnly(right).getTime();

  return Math.round((leftTime - rightTime) / 86400000);
}

function getBestStreak(dateKeys: string[]) {
  if (dateKeys.length === 0) {
    return 0;
  }

  const asc = [...dateKeys].sort((a, b) => Date.parse(a) - Date.parse(b));
  let best = 1;
  let current = 1;

  for (let index = 1; index < asc.length; index += 1) {
    if (diffDays(asc[index], asc[index - 1]) === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function getCurrentStreak(dateKeys: string[]) {
  if (dateKeys.length === 0) {
    return 0;
  }

  const desc = [...dateKeys].sort((a, b) => Date.parse(b) - Date.parse(a));
  let streak = 1;

  for (let index = 1; index < desc.length; index += 1) {
    if (diffDays(desc[index - 1], desc[index]) === 1) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function getActivityLevel(views: number): 0 | 1 | 2 | 3 | 4 {
  if (views <= 0) {
    return 0;
  }

  if (views === 1) {
    return 1;
  }

  if (views <= 3) {
    return 2;
  }

  if (views <= 5) {
    return 3;
  }

  return 4;
}

export function derivePersonalInsights(
  questions: QuestionMeta[],
  data: StudyStoreData,
  currentUser: string | null
): PersonalInsights | null {
  if (!currentUser) {
    return null;
  }

  const entries = questions.reduce<PersonalEntry[]>((list, question) => {
    const activity = getQuestionActivity(data, question.slug);

    if (
      activity.viewedByUser[currentUser] ||
      activity.favoritedBy.includes(currentUser) ||
      activity.likedBy.includes(currentUser) ||
      activity.masteredBy.includes(currentUser) ||
      activity.notesByUser[currentUser]?.trim() ||
      activity.comments.some((comment) => comment.user === currentUser)
    ) {
      list.push({ question, activity });
    }

    return list;
  }, []);

  const history = entries
    .filter((entry) => entry.activity.viewedByUser[currentUser])
    .map((entry) => ({
      ...entry,
      view: entry.activity.viewedByUser[currentUser]
    }))
    .sort((a, b) => Date.parse(b.view.lastViewedAt) - Date.parse(a.view.lastViewedAt));

  const favorites = entries.filter((entry) => entry.activity.favoritedBy.includes(currentUser));
  const likes = entries.filter((entry) => entry.activity.likedBy.includes(currentUser));
  const mastered = entries.filter((entry) => entry.activity.masteredBy.includes(currentUser));
  const notes = entries
    .filter((entry) => entry.activity.notesByUser[currentUser]?.trim())
    .map((entry) => ({
      ...entry,
      note: entry.activity.notesByUser[currentUser].trim()
    }));
  const comments = entries
    .flatMap((entry) =>
      entry.activity.comments
        .filter((comment) => comment.user === currentUser)
        .map((comment) => ({
          comment,
          question: entry.question
        }))
    )
    .sort((a, b) => Date.parse(b.comment.createdAt) - Date.parse(a.comment.createdAt));

  const categoryHeat = history.reduce<Record<string, number>>((map, entry) => {
    map[entry.question.category] = (map[entry.question.category] ?? 0) + entry.view.count;
    return map;
  }, {});

  const hottestCategories = Object.entries(categoryHeat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const latestVisit = history[0]?.view.lastViewedAt ?? null;
  const nextContinue = history.find((entry) => !entry.activity.masteredBy.includes(currentUser)) ?? history[0] ?? null;
  const totalTracked = new Set([...favorites, ...likes, ...mastered, ...notes, ...history].map((entry) => entry.question.slug))
    .size;
  const reviewQueue = entries
    .map((entry) => {
      const reasons: string[] = [];
      let priority = 0;

      if (!entry.activity.masteredBy.includes(currentUser)) {
        reasons.push("还没掌握");
        priority += 5;
      }

      if (entry.activity.favoritedBy.includes(currentUser)) {
        reasons.push("你收藏过");
        priority += 4;
      }

      if (entry.activity.notesByUser[currentUser]?.trim()) {
        reasons.push("留过笔记");
        priority += 3;
      }

      if ((entry.activity.viewedByUser[currentUser]?.count ?? 0) >= 2) {
        reasons.push("反复看过");
        priority += 2;
      }

      if (entry.activity.likedBy.includes(currentUser)) {
        reasons.push("点过赞");
        priority += 1;
      }

      return {
        ...entry,
        priority,
        reasons,
        view: entry.activity.viewedByUser[currentUser] ?? null
      };
    })
    .filter((entry) => entry.priority > 0)
    .sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }

      return Date.parse(b.view?.lastViewedAt ?? "1970-01-01") - Date.parse(a.view?.lastViewedAt ?? "1970-01-01");
    });
  const hardestToRevisit = reviewQueue
    .filter(
      (entry) =>
        !entry.activity.masteredBy.includes(currentUser) &&
        ((entry.view?.count ?? 0) >= 2 || entry.activity.notesByUser[currentUser]?.trim() || entry.activity.favoritedBy.includes(currentUser))
    )
    .slice(0, 6);

  const activityByDay = history.reduce<Record<string, ActivityDay>>((map, entry) => {
    const dateKey = toDateKey(entry.view.lastViewedAt);
    const existing = map[dateKey];

    map[dateKey] = {
      dateKey,
      label: formatActivityLabel(dateKey),
      shortLabel: formatActivityShortLabel(dateKey),
      views: (existing?.views ?? 0) + entry.view.count,
      questionCount: (existing?.questionCount ?? 0) + 1
    };

    return map;
  }, {});

  const allActivityDays = Object.values(activityByDay).sort((a, b) => Date.parse(b.dateKey) - Date.parse(a.dateKey));
  const recentActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dateKey = toDateKey(date);

    return (
      activityByDay[dateKey] ?? {
        dateKey,
        label: formatActivityLabel(dateKey),
        shortLabel: formatActivityShortLabel(dateKey),
        views: 0,
        questionCount: 0
      }
    );
  });
  const activityCalendar = Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));
    const dateKey = toDateKey(date);
    const day =
      activityByDay[dateKey] ?? {
        dateKey,
        label: formatActivityLabel(dateKey),
        shortLabel: formatActivityShortLabel(dateKey),
        views: 0,
        questionCount: 0
      };

    return {
      ...day,
      level: getActivityLevel(day.views)
    };
  });
  const uniqueDates = allActivityDays.map((item) => item.dateKey);
  const activeDays = uniqueDates.length;
  const currentStreak = getCurrentStreak(uniqueDates);
  const bestStreak = getBestStreak(uniqueDates);
  const thisWeekViews = recentActivity.reduce((sum, day) => sum + day.views, 0);
  const pendingCount = questions.length - mastered.length;
  const routeProgress = Array.from(new Set(questions.map((question) => question.route)))
    .map((route) => {
      const routeQuestions = questions.filter((question) => question.route === route);
      const routeEntries = entries.filter((entry) => entry.question.route === route);
      const routeMastered = routeEntries.filter((entry) => entry.activity.masteredBy.includes(currentUser)).length;
      const routeViewed = routeEntries.filter((entry) => !!entry.activity.viewedByUser[currentUser]).length;
      const total = routeQuestions.length;

      return {
        route,
        total,
        mastered: routeMastered,
        viewed: routeViewed,
        pending: total - routeMastered,
        progress: total > 0 ? Math.round((routeMastered / total) * 100) : 0
      };
    })
    .filter((item) => item.viewed > 0 || item.mastered > 0)
    .sort((a, b) => b.progress - a.progress || b.viewed - a.viewed || a.total - b.total)
    .slice(0, 6);
  const categoryFocus = Array.from(new Set(questions.map((question) => question.category)))
    .map((category) => {
      const categoryQuestions = questions.filter((question) => question.category === category);
      const categoryEntries = entries.filter((entry) => entry.question.category === category);
      const viewed = categoryEntries.filter((entry) => !!entry.activity.viewedByUser[currentUser]).length;
      const masteredCount = categoryEntries.filter((entry) => entry.activity.masteredBy.includes(currentUser)).length;
      const favoriteCount = categoryEntries.filter((entry) => entry.activity.favoritedBy.includes(currentUser)).length;
      const reviewNeeded = categoryEntries.filter((entry) =>
        !entry.activity.masteredBy.includes(currentUser) &&
        (
          !!entry.activity.notesByUser[currentUser]?.trim() ||
          entry.activity.favoritedBy.includes(currentUser) ||
          (entry.activity.viewedByUser[currentUser]?.count ?? 0) >= 2
        )
      ).length;
      const total = categoryQuestions.length;
      const progress = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
      const gapScore = reviewNeeded * 4 + Math.max(viewed - masteredCount, 0) * 2 + favoriteCount;

      return {
        category,
        total,
        viewed,
        mastered: masteredCount,
        reviewNeeded,
        favoriteCount,
        progress,
        gapScore
      };
    })
    .filter((item) => item.viewed > 0 || item.favoriteCount > 0 || item.reviewNeeded > 0)
    .sort((a, b) => b.gapScore - a.gapScore || a.progress - b.progress || b.viewed - a.viewed)
    .slice(0, 6);

  return {
    entries,
    history,
    favorites,
    likes,
    mastered,
    notes,
    comments,
    hottestCategories,
    latestVisit,
    nextContinue,
    totalTracked,
    reviewQueue,
    activeDays,
    currentStreak,
    bestStreak,
    thisWeekViews,
    recentActivity,
    activityCalendar,
    routeProgress,
    categoryFocus,
    hardestToRevisit,
    pendingCount
  };
}
