import type { QuestionMeta } from "@/lib/content";
import { getQuestionActivity, type QuestionActivity, type QuestionViewRecord, type StudyComment, type StudyStoreData } from "@/lib/study-store";

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
};

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
    reviewQueue
  };
}
