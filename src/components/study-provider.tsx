"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import {
  canIncrementView,
  getEmptyStudyStore,
  getQuestionActivity,
  hasUser,
  type QuestionActivity,
  type StudyStoreData
} from "@/lib/study-store";

type AuthResult = {
  ok: boolean;
  message: string;
};

type StudyContextValue = {
  data: StudyStoreData;
  ready: boolean;
  currentUser: string | null;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (username: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  getActivity: (slug: string) => QuestionActivity;
  incrementView: (slug: string) => void;
  toggleLike: (slug: string) => Promise<AuthResult>;
  toggleFavorite: (slug: string) => Promise<AuthResult>;
  toggleMastered: (slug: string) => Promise<AuthResult>;
  saveNote: (slug: string, note: string) => Promise<AuthResult>;
  addComment: (slug: string, content: string) => Promise<AuthResult>;
  getOverview: () => {
    totalLikes: number;
    totalFavorites: number;
    masteredCount: number;
    noteCount: number;
    totalViews: number;
    commentCount: number;
  };
};

type ApiPayload = {
  ok?: boolean;
  message?: string;
  data?: StudyStoreData;
};

const StudyContext = createContext<StudyContextValue | null>(null);

async function readPayload(response: Response): Promise<ApiPayload> {
  try {
    return (await response.json()) as ApiPayload;
  } catch {
    return {};
  }
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<StudyStoreData>(getEmptyStudyStore());

  const applyPayload = useCallback((payload: ApiPayload) => {
    if (payload.data) {
      setData(payload.data);
    }
  }, []);

  const requestData = useCallback(
    async (url: string, init?: RequestInit, fallbackMessage = "操作失败，请稍后再试。"): Promise<AuthResult> => {
      try {
        const response = await fetch(url, {
          ...init,
          headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {})
          }
        });
        const payload = await readPayload(response);

        applyPayload(payload);

        return {
          ok: response.ok && payload.ok !== false,
          message: payload.message ?? (response.ok ? "操作已保存到数据库。" : fallbackMessage)
        };
      } catch {
        return { ok: false, message: "数据库连接失败，请确认服务已启动。" };
      }
    },
    [applyPayload]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/study", { cache: "no-store" });
        const payload = await readPayload(response);

        if (!cancelled) {
          setData(payload.data ?? getEmptyStudyStore());
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setData(getEmptyStudyStore());
          setReady(true);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const requireUser = useCallback(
    (action: string) => {
      if (!data.currentUser) {
        return {
          ok: false,
          message: `先登录，再${action}。`
        };
      }

      return null;
    },
    [data.currentUser]
  );

  const login = useCallback(
    async (username: string, password: string) =>
      requestData(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ username, password })
        },
        "账号或密码不对，再看一眼。"
      ),
    [requestData]
  );

  const register = useCallback(
    async (username: string, password: string) =>
      requestData(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ username, password })
        },
        "注册失败，请换个账号名试试。"
      ),
    [requestData]
  );

  const logout = useCallback(async () => {
    await requestData("/api/auth/logout", { method: "POST" });
  }, [requestData]);

  const incrementView = useCallback(
    (slug: string) => {
      if (!ready || !canIncrementView(slug)) {
        return;
      }

      void requestData(`/api/study/questions/${encodeURIComponent(slug)}/view`, { method: "POST" });
    },
    [ready, requestData]
  );

  const toggleLike = useCallback(
    async (slug: string): Promise<AuthResult> => {
      const blocked = requireUser("点赞");

      if (blocked) {
        return blocked;
      }

      return requestData(`/api/study/questions/${encodeURIComponent(slug)}/toggle`, {
        method: "POST",
        body: JSON.stringify({ action: "like" })
      });
    },
    [requireUser, requestData]
  );

  const toggleFavorite = useCallback(
    async (slug: string): Promise<AuthResult> => {
      const blocked = requireUser("收藏");

      if (blocked) {
        return blocked;
      }

      return requestData(`/api/study/questions/${encodeURIComponent(slug)}/toggle`, {
        method: "POST",
        body: JSON.stringify({ action: "favorite" })
      });
    },
    [requireUser, requestData]
  );

  const toggleMastered = useCallback(
    async (slug: string): Promise<AuthResult> => {
      const blocked = requireUser("标记掌握");

      if (blocked) {
        return blocked;
      }

      return requestData(`/api/study/questions/${encodeURIComponent(slug)}/toggle`, {
        method: "POST",
        body: JSON.stringify({ action: "mastered" })
      });
    },
    [requireUser, requestData]
  );

  const saveNote = useCallback(
    async (slug: string, note: string): Promise<AuthResult> => {
      const blocked = requireUser("保存笔记");

      if (blocked) {
        return blocked;
      }

      return requestData(`/api/study/questions/${encodeURIComponent(slug)}/note`, {
        method: "PUT",
        body: JSON.stringify({ note })
      });
    },
    [requireUser, requestData]
  );

  const addComment = useCallback(
    async (slug: string, content: string): Promise<AuthResult> => {
      const blocked = requireUser("发表评论");

      if (blocked) {
        return blocked;
      }

      if (content.trim().length < 2) {
        return { ok: false, message: "评论太短了，至少写两三个字。" };
      }

      return requestData(`/api/study/questions/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        body: JSON.stringify({ content })
      });
    },
    [requireUser, requestData]
  );

  const value = useMemo<StudyContextValue>(
    () => ({
      data,
      ready,
      currentUser: data.currentUser,
      login,
      register,
      logout,
      getActivity: (slug) => getQuestionActivity(data, slug),
      incrementView,
      toggleLike,
      toggleFavorite,
      toggleMastered,
      saveNote,
      addComment,
      getOverview: () => {
        const activities = Object.values(data.questions);
        const currentUser = data.currentUser;

        return {
          totalLikes: activities.reduce((sum, item) => sum + (hasUser(item.likedBy, currentUser) ? 1 : 0), 0),
          totalFavorites: activities.reduce((sum, item) => sum + (hasUser(item.favoritedBy, currentUser) ? 1 : 0), 0),
          masteredCount: activities.reduce((sum, item) => sum + (hasUser(item.masteredBy, currentUser) ? 1 : 0), 0),
          noteCount: activities.reduce(
            (sum, item) => sum + (currentUser && item.notesByUser[currentUser]?.trim() ? 1 : 0),
            0
          ),
          totalViews: activities.reduce(
            (sum, item) => sum + (currentUser ? (item.viewedByUser[currentUser]?.count ?? 0) : item.views),
            0
          ),
          commentCount: activities.reduce(
            (sum, item) => sum + item.comments.filter((comment) => comment.user === currentUser).length,
            0
          )
        };
      }
    }),
    [
      addComment,
      data,
      incrementView,
      login,
      logout,
      ready,
      register,
      saveNote,
      toggleFavorite,
      toggleLike,
      toggleMastered
    ]
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);

  if (!context) {
    throw new Error("useStudy must be used within StudyProvider");
  }

  return context;
}
