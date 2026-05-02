"use client";

export type StudyUser = {
  username: string;
  password: string;
  createdAt: string;
};

export type StudyComment = {
  id: string;
  user: string;
  content: string;
  createdAt: string;
};

export type QuestionActivity = {
  views: number;
  likedBy: string[];
  favoritedBy: string[];
  masteredBy: string[];
  notesByUser: Record<string, string>;
  comments: StudyComment[];
};

export type StudyStoreData = {
  users: StudyUser[];
  currentUser: string | null;
  questions: Record<string, QuestionActivity>;
};

const STORAGE_KEY = "you-deserve.study-store";
const SESSION_VIEW_KEY = "you-deserve.session-views";

function ensureQuestionActivity(activity?: Partial<QuestionActivity>): QuestionActivity {
  return {
    views: activity?.views ?? 0,
    likedBy: activity?.likedBy ?? [],
    favoritedBy: activity?.favoritedBy ?? [],
    masteredBy: activity?.masteredBy ?? [],
    notesByUser: activity?.notesByUser ?? {},
    comments: activity?.comments ?? []
  };
}

export function getEmptyStudyStore(): StudyStoreData {
  return {
    users: [],
    currentUser: null,
    questions: {}
  };
}

export function loadStudyStore(): StudyStoreData {
  if (typeof window === "undefined") {
    return getEmptyStudyStore();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return getEmptyStudyStore();
    }

    const parsed = JSON.parse(raw) as Partial<StudyStoreData>;

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      currentUser: typeof parsed.currentUser === "string" ? parsed.currentUser : null,
      questions: Object.fromEntries(
        Object.entries(parsed.questions ?? {}).map(([slug, activity]) => [slug, ensureQuestionActivity(activity)])
      )
    };
  } catch {
    return getEmptyStudyStore();
  }
}

export function saveStudyStore(data: StudyStoreData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getQuestionActivity(data: StudyStoreData, slug: string): QuestionActivity {
  return ensureQuestionActivity(data.questions[slug]);
}

export function withQuestionActivity(
  data: StudyStoreData,
  slug: string,
  updater: (activity: QuestionActivity) => QuestionActivity
): StudyStoreData {
  const current = getQuestionActivity(data, slug);

  return {
    ...data,
    questions: {
      ...data.questions,
      [slug]: ensureQuestionActivity(updater(current))
    }
  };
}

export function hasUser(list: string[], username: string | null) {
  return !!username && list.includes(username);
}

export function toggleUser(list: string[], username: string | null) {
  if (!username) {
    return list;
  }

  return list.includes(username) ? list.filter((item) => item !== username) : [...list, username];
}

export function canIncrementView(slug: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const viewed = new Set<string>(JSON.parse(window.sessionStorage.getItem(SESSION_VIEW_KEY) ?? "[]") as string[]);

  if (viewed.has(slug)) {
    return false;
  }

  viewed.add(slug);
  window.sessionStorage.setItem(SESSION_VIEW_KEY, JSON.stringify([...viewed]));

  return true;
}
