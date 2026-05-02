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
  loadStudyStore,
  saveStudyStore,
  toggleUser,
  withQuestionActivity,
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
  login: (username: string, password: string) => AuthResult;
  register: (username: string, password: string) => AuthResult;
  logout: () => void;
  getActivity: (slug: string) => QuestionActivity;
  incrementView: (slug: string) => void;
  toggleLike: (slug: string) => AuthResult;
  toggleFavorite: (slug: string) => AuthResult;
  toggleMastered: (slug: string) => AuthResult;
  saveNote: (slug: string, note: string) => AuthResult;
  addComment: (slug: string, content: string) => AuthResult;
  getOverview: () => {
    totalLikes: number;
    totalFavorites: number;
    masteredCount: number;
    noteCount: number;
    totalViews: number;
  };
};

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<StudyStoreData>(getEmptyStudyStore());

  useEffect(() => {
    const initial = loadStudyStore();
    const frame = window.requestAnimationFrame(() => {
      setData(initial);
      setReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const updateStore = useCallback((updater: (previous: StudyStoreData) => StudyStoreData) => {
    setData((previous) => {
      const next = updater(previous);
      saveStudyStore(next);
      return next;
    });
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
    (username: string, password: string): AuthResult => {
      const normalized = username.trim();
      const matched = data.users.find((user) => user.username === normalized);

      if (!matched || matched.password !== password) {
        return { ok: false, message: "账号或密码不对，再看一眼。" };
      }

      updateStore((previous) => ({
        ...previous,
        currentUser: normalized
      }));

      return { ok: true, message: `欢迎回来，${normalized}` };
    },
    [data.users, updateStore]
  );

  const register = useCallback(
    (username: string, password: string): AuthResult => {
      const normalized = username.trim();

      if (normalized.length < 2) {
        return { ok: false, message: "昵称至少 2 个字。" };
      }

      if (password.length < 4) {
        return { ok: false, message: "密码至少 4 位，先别太随意。" };
      }

      if (data.users.some((user) => user.username === normalized)) {
        return { ok: false, message: "这个昵称已经被用了，换一个。" };
      }

      updateStore((previous) => ({
        ...previous,
        users: [
          ...previous.users,
          {
            username: normalized,
            password,
            createdAt: new Date().toISOString()
          }
        ],
        currentUser: normalized
      }));

      return { ok: true, message: `注册成功，${normalized}` };
    },
    [data.users, updateStore]
  );

  const logout = useCallback(() => {
    updateStore((previous) => ({
      ...previous,
      currentUser: null
    }));
  }, [updateStore]);

  const incrementView = useCallback(
    (slug: string) => {
      if (!ready || !canIncrementView(slug)) {
        return;
      }

      updateStore((previous) =>
        withQuestionActivity(previous, slug, (activity) => ({
          ...activity,
          views: activity.views + 1
        }))
      );
    },
    [ready, updateStore]
  );

  const toggleLike = useCallback(
    (slug: string): AuthResult => {
      const blocked = requireUser("点赞");

      if (blocked) {
        return blocked;
      }

      updateStore((previous) =>
        withQuestionActivity(previous, slug, (activity) => ({
          ...activity,
          likedBy: toggleUser(activity.likedBy, previous.currentUser)
        }))
      );

      return { ok: true, message: "已更新点赞状态。" };
    },
    [requireUser, updateStore]
  );

  const toggleFavorite = useCallback(
    (slug: string): AuthResult => {
      const blocked = requireUser("收藏");

      if (blocked) {
        return blocked;
      }

      updateStore((previous) =>
        withQuestionActivity(previous, slug, (activity) => ({
          ...activity,
          favoritedBy: toggleUser(activity.favoritedBy, previous.currentUser)
        }))
      );

      return { ok: true, message: "已更新收藏状态。" };
    },
    [requireUser, updateStore]
  );

  const toggleMastered = useCallback(
    (slug: string): AuthResult => {
      const blocked = requireUser("标记掌握");

      if (blocked) {
        return blocked;
      }

      updateStore((previous) =>
        withQuestionActivity(previous, slug, (activity) => ({
          ...activity,
          masteredBy: toggleUser(activity.masteredBy, previous.currentUser)
        }))
      );

      return { ok: true, message: "掌握状态已更新。" };
    },
    [requireUser, updateStore]
  );

  const saveNote = useCallback(
    (slug: string, note: string): AuthResult => {
      const blocked = requireUser("保存笔记");

      if (blocked) {
        return blocked;
      }

      updateStore((previous) =>
        withQuestionActivity(previous, slug, (activity) => ({
          ...activity,
          notesByUser: {
            ...activity.notesByUser,
            [previous.currentUser as string]: note.trim()
          }
        }))
      );

      return { ok: true, message: "笔记已经记下来了。" };
    },
    [requireUser, updateStore]
  );

  const addComment = useCallback(
    (slug: string, content: string): AuthResult => {
      const blocked = requireUser("发表评论");

      if (blocked) {
        return blocked;
      }

      const normalized = content.trim();

      if (normalized.length < 2) {
        return { ok: false, message: "评论太短了，至少写两三个字。" };
      }

      updateStore((previous) =>
        withQuestionActivity(previous, slug, (activity) => ({
          ...activity,
          comments: [
            {
              id: `${slug}-${Date.now()}`,
              user: previous.currentUser as string,
              content: normalized,
              createdAt: new Date().toISOString()
            },
            ...activity.comments
          ]
        }))
      );

      return { ok: true, message: "评论发出去了。" };
    },
    [requireUser, updateStore]
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
          totalLikes: activities.reduce((sum, item) => sum + item.likedBy.length, 0),
          totalFavorites: activities.reduce((sum, item) => sum + item.favoritedBy.length, 0),
          masteredCount: activities.reduce((sum, item) => sum + (hasUser(item.masteredBy, currentUser) ? 1 : 0), 0),
          noteCount: activities.reduce(
            (sum, item) => sum + (currentUser && item.notesByUser[currentUser]?.trim() ? 1 : 0),
            0
          ),
          totalViews: activities.reduce((sum, item) => sum + item.views, 0)
        };
      }
    }),
    [addComment, data, incrementView, login, logout, ready, register, saveNote, toggleFavorite, toggleLike, toggleMastered]
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
