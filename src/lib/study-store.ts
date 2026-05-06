export type StudyUser = {
  id: string;
  username: string;
  createdAt: string;
  disabled?: boolean;
};

export type StudyComment = {
  id: string;
  user: string;
  content: string;
  createdAt: string;
};

export type QuestionViewRecord = {
  count: number;
  lastViewedAt: string;
};

export type QuestionActivity = {
  views: number;
  likedBy: string[];
  favoritedBy: string[];
  masteredBy: string[];
  viewedByUser: Record<string, QuestionViewRecord>;
  notesByUser: Record<string, string>;
  comments: StudyComment[];
};

export type StudyStoreData = {
  users: StudyUser[];
  currentUser: string | null;
  questions: Record<string, QuestionActivity>;
};

const SESSION_VIEW_KEY = "you-deserve.session-views";

function ensureQuestionActivity(activity?: Partial<QuestionActivity>): QuestionActivity {
  return {
    views: activity?.views ?? 0,
    likedBy: activity?.likedBy ?? [],
    favoritedBy: activity?.favoritedBy ?? [],
    masteredBy: activity?.masteredBy ?? [],
    viewedByUser: activity?.viewedByUser ?? {},
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
  return getEmptyStudyStore();
}

export function saveStudyStore(data: StudyStoreData) {
  void data;
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

  let viewed = new Set<string>();

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_VIEW_KEY) ?? "[]");

    if (Array.isArray(parsed)) {
      viewed = new Set(parsed.filter((item): item is string => typeof item === "string"));
    }
  } catch {
    viewed = new Set<string>();
  }

  if (viewed.has(slug)) {
    return false;
  }

  viewed.add(slug);

  try {
    window.sessionStorage.setItem(SESSION_VIEW_KEY, JSON.stringify([...viewed]));
  } catch {
    return true;
  }

  return true;
}
