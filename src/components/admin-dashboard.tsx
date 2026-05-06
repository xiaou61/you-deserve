"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookMarked,
  Bookmark,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  KeyRound,
  LogOut,
  MessageSquare,
  NotebookPen,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  type LucideIcon
} from "lucide-react";

import type { AdminAccount } from "@/lib/admin-data";
import type { Difficulty, QuestionMeta } from "@/lib/content";
import { getQuestionActivity, type QuestionActivity, type StudyComment, type StudyStoreData, type StudyUser } from "@/lib/study-store";

type AdminDashboardProps = {
  questions: QuestionMeta[];
  categories: string[];
  routes: string[];
};

type AdminTab = "overview" | "users" | "admins" | "questions" | "comments" | "notes" | "data";
type QuestionSort = "signals" | "views" | "comments" | "reading";

type SessionAdmin = {
  id: string;
  username: string;
};

type AdminPayload = {
  ok?: boolean;
  message?: string;
  admin?: SessionAdmin | null;
  data?: StudyStoreData;
  admins?: AdminAccount[];
};

type QuestionRow = {
  question: QuestionMeta;
  activity: QuestionActivity;
  noteCount: number;
  totalSignals: number;
  userViewers: number;
};

type UserRow = {
  user: StudyUser;
  views: number;
  likes: number;
  favorites: number;
  mastered: number;
  notes: number;
  comments: number;
  lastViewedAt: string | null;
};

type CommentRow = {
  comment: StudyComment;
  question: QuestionMeta;
};

type NoteRow = {
  user: string;
  note: string;
  question: QuestionMeta;
};

const adminTabs: Array<{ icon: LucideIcon; label: string; value: AdminTab }> = [
  { value: "overview", icon: BarChart3, label: "总览" },
  { value: "users", icon: Users, label: "用户" },
  { value: "admins", icon: ShieldCheck, label: "管理员" },
  { value: "questions", icon: FileText, label: "题库" },
  { value: "comments", icon: MessageSquare, label: "评论" },
  { value: "notes", icon: NotebookPen, label: "笔记" },
  { value: "data", icon: Database, label: "数据" }
];

const adminDatabaseUnavailableMessage = "后台数据库连接失败，请确认 PostgreSQL 已启动。";

function formatDate(iso: string | null) {
  if (!iso) {
    return "暂无";
  }

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

function excerpt(text: string, max = 110) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max)}...` : normalized;
}

function emptyData(): StudyStoreData {
  return {
    users: [],
    currentUser: null,
    questions: {}
  };
}

async function readPayload(response: Response): Promise<AdminPayload> {
  try {
    return (await response.json()) as AdminPayload;
  } catch {
    return {};
  }
}

function buildExport(data: StudyStoreData, admins: AdminAccount[]) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      database: "postgresql",
      users: data.users,
      admins: admins.map(({ id, username, createdAt, disabled }) => ({ id, username, createdAt, disabled })),
      questions: data.questions
    },
    null,
    2
  );
}

export function AdminDashboard({ questions, categories, routes }: AdminDashboardProps) {
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState<SessionAdmin | null>(null);
  const [data, setData] = useState<StudyStoreData>(emptyData());
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [message, setMessage] = useState("");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [userForm, setUserForm] = useState({ username: "", password: "" });
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({});
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [contentQuery, setContentQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [sort, setSort] = useState<QuestionSort>("signals");

  const showMessage = useCallback((copy: string) => {
    setMessage(copy);
    window.setTimeout(() => setMessage(""), 3200);
  }, []);

  const applyPayload = useCallback((payload: AdminPayload) => {
    if ("admin" in payload) {
      setAdmin(payload.admin ?? null);
    }

    if (payload.data) {
      setData(payload.data);
    }

    if (payload.admins) {
      setAdmins(payload.admins);
    }

    if (payload.message) {
      showMessage(payload.message);
    }
  }, [showMessage]);

  const adminRequest = async (url: string, init?: RequestInit) => {
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

      if (!response.ok && response.status === 401) {
        setAdmin(null);
      }

      const fallbackMessage = response.status >= 500 ? adminDatabaseUnavailableMessage : "操作失败。";
      const message = payload.message ?? (response.ok ? "操作已完成。" : fallbackMessage);

      if (!response.ok && !payload.message) {
        showMessage(message);
      }

      return {
        ok: response.ok && payload.ok !== false,
        message
      };
    } catch {
      const offline = adminDatabaseUnavailableMessage;
      showMessage(offline);
      return { ok: false, message: offline };
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const payload = await readPayload(response);

        if (!cancelled) {
          applyPayload(payload);
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setMessage(adminDatabaseUnavailableMessage);
          setReady(true);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [applyPayload]);

  const allQuestionRows = useMemo<QuestionRow[]>(
    () =>
      questions.map((question) => {
        const activity = getQuestionActivity(data, question.slug);
        const noteCount = Object.values(activity.notesByUser).filter((note) => note.trim()).length;

        return {
          question,
          activity,
          noteCount,
          totalSignals:
            activity.views +
            activity.likedBy.length +
            activity.favoritedBy.length +
            activity.masteredBy.length +
            activity.comments.length +
            noteCount,
          userViewers: Object.keys(activity.viewedByUser).length
        };
      }),
    [data, questions]
  );

  const questionRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return allQuestionRows
      .filter((row) => {
        if (category !== "all" && row.question.category !== category) {
          return false;
        }

        if (difficulty !== "all" && row.question.difficulty !== difficulty) {
          return false;
        }

        if (!normalized) {
          return true;
        }

        return [
          row.question.title,
          row.question.summary,
          row.question.category,
          row.question.route,
          row.question.scene,
          ...row.question.tags
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => {
        if (sort === "views") {
          return b.activity.views - a.activity.views;
        }

        if (sort === "comments") {
          return b.activity.comments.length - a.activity.comments.length;
        }

        if (sort === "reading") {
          return b.question.readingTime - a.question.readingTime;
        }

        return b.totalSignals - a.totalSignals || a.question.order - b.question.order;
      });
  }, [allQuestionRows, category, difficulty, query, sort]);

  const userRows = useMemo<UserRow[]>(
    () =>
      data.users
        .map((user) => {
          const stats = allQuestionRows.reduce(
            (acc, row) => {
              const view = row.activity.viewedByUser[user.username];

              return {
                views: acc.views + (view?.count ?? 0),
                likes: acc.likes + (row.activity.likedBy.includes(user.username) ? 1 : 0),
                favorites: acc.favorites + (row.activity.favoritedBy.includes(user.username) ? 1 : 0),
                mastered: acc.mastered + (row.activity.masteredBy.includes(user.username) ? 1 : 0),
                notes: acc.notes + (row.activity.notesByUser[user.username]?.trim() ? 1 : 0),
                comments: acc.comments + row.activity.comments.filter((comment) => comment.user === user.username).length,
                lastViewedAt:
                  view && (!acc.lastViewedAt || Date.parse(view.lastViewedAt) > Date.parse(acc.lastViewedAt))
                    ? view.lastViewedAt
                    : acc.lastViewedAt
              };
            },
            {
              views: 0,
              likes: 0,
              favorites: 0,
              mastered: 0,
              notes: 0,
              comments: 0,
              lastViewedAt: null as string | null
            }
          );

          return { user, ...stats };
        })
        .sort((a, b) => Number(a.user.disabled) - Number(b.user.disabled) || b.views + b.comments + b.notes - (a.views + a.comments + a.notes)),
    [allQuestionRows, data.users]
  );

  const commentRows = useMemo<CommentRow[]>(
    () =>
      allQuestionRows
        .flatMap((row) =>
          row.activity.comments.map((comment) => ({
            comment,
            question: row.question
          }))
        )
        .sort((a, b) => Date.parse(b.comment.createdAt) - Date.parse(a.comment.createdAt)),
    [allQuestionRows]
  );

  const noteRows = useMemo<NoteRow[]>(
    () =>
      allQuestionRows
        .flatMap((row) =>
          Object.entries(row.activity.notesByUser)
            .filter(([, note]) => note.trim())
            .map(([user, note]) => ({
              user,
              note: note.trim(),
              question: row.question
            }))
        )
        .sort((a, b) => a.question.order - b.question.order),
    [allQuestionRows]
  );

  const filteredCommentRows = useMemo(() => {
    const normalized = contentQuery.trim().toLowerCase();

    return commentRows.filter((row) => {
      if (!normalized) {
        return true;
      }

      return [row.comment.user, row.comment.content, row.question.title, row.question.category]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [commentRows, contentQuery]);

  const filteredNoteRows = useMemo(() => {
    const normalized = contentQuery.trim().toLowerCase();

    return noteRows.filter((row) => {
      if (!normalized) {
        return true;
      }

      return [row.user, row.note, row.question.title, row.question.category].join(" ").toLowerCase().includes(normalized);
    });
  }, [contentQuery, noteRows]);

  const globalStats = useMemo(() => {
    const totalViews = allQuestionRows.reduce((sum, row) => sum + row.activity.views, 0);
    const totalLikes = allQuestionRows.reduce((sum, row) => sum + row.activity.likedBy.length, 0);
    const totalFavorites = allQuestionRows.reduce((sum, row) => sum + row.activity.favoritedBy.length, 0);
    const totalMastered = allQuestionRows.reduce((sum, row) => sum + row.activity.masteredBy.length, 0);
    const activeUsers = data.users.filter((user) => !user.disabled).length;

    return {
      activeUsers,
      totalUsers: data.users.length,
      admins: admins.length,
      totalViews,
      totalLikes,
      totalFavorites,
      totalMastered,
      totalComments: commentRows.length,
      totalNotes: noteRows.length,
      trackedQuestions: allQuestionRows.filter((row) => row.totalSignals > 0).length
    };
  }, [admins.length, allQuestionRows, commentRows.length, data.users, noteRows.length]);

  const dataHealth = useMemo(() => {
    const validQuestionSlugs = new Set(questions.map((question) => question.slug));
    const validUsers = new Set(data.users.map((user) => user.username));
    let unknownUserRefs = 0;
    const orphanActivities: string[] = [];
    const emptyActivities: string[] = [];

    Object.entries(data.questions).forEach(([slug, activity]) => {
      const hasSignal =
        activity.views > 0 ||
        activity.likedBy.length > 0 ||
        activity.favoritedBy.length > 0 ||
        activity.masteredBy.length > 0 ||
        Object.keys(activity.viewedByUser).length > 0 ||
        Object.values(activity.notesByUser).some((note) => note.trim()) ||
        activity.comments.length > 0;

      if (!validQuestionSlugs.has(slug)) {
        orphanActivities.push(slug);
      } else if (!hasSignal) {
        emptyActivities.push(slug);
      }

      unknownUserRefs += activity.likedBy.filter((user) => !validUsers.has(user)).length;
      unknownUserRefs += activity.favoritedBy.filter((user) => !validUsers.has(user)).length;
      unknownUserRefs += activity.masteredBy.filter((user) => !validUsers.has(user)).length;
      unknownUserRefs += Object.keys(activity.viewedByUser).filter((user) => !validUsers.has(user)).length;
      unknownUserRefs += Object.keys(activity.notesByUser).filter((user) => !validUsers.has(user)).length;
      unknownUserRefs += activity.comments.filter((comment) => !validUsers.has(comment.user)).length;
    });

    return {
      orphanActivities,
      emptyActivities,
      unknownUserRefs
    };
  }, [data.questions, data.users, questions]);

  const confirmAction = (copy: string) => window.confirm(copy);

  const handleLogin = async () => {
    await adminRequest("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify(loginForm)
    });
    setLoginForm({ username: "", password: "" });
  };

  const handleLogout = async () => {
    await adminRequest("/api/admin/auth/logout", { method: "POST" });
    setAdmin(null);
    setData(emptyData());
    setAdmins([]);
  };

  const createUser = async () => {
    const result = await adminRequest("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(userForm)
    });

    if (result.ok) {
      setUserForm({ username: "", password: "" });
    }
  };

  const createAdmin = async () => {
    const result = await adminRequest("/api/admin/admins", {
      method: "POST",
      body: JSON.stringify(adminForm)
    });

    if (result.ok) {
      setAdminForm({ username: "", password: "" });
    }
  };

  const patchUser = async (user: StudyUser, body: Record<string, unknown>) => {
    await adminRequest(`/api/admin/users/${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  };

  const patchAdmin = async (target: AdminAccount, body: Record<string, unknown>) => {
    await adminRequest(`/api/admin/admins/${encodeURIComponent(target.id)}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  };

  const renameEntity = async (kind: "user" | "admin", id: string, current: string) => {
    const next = renameDrafts[id]?.trim();

    if (!next || next === current) {
      setMessage("先输入一个新的账号名。");
      return;
    }

    if (kind === "user") {
      const target = data.users.find((item) => item.id === id);
      if (target) {
        await patchUser(target, { username: next });
      }
    } else {
      const target = admins.find((item) => item.id === id);
      if (target) {
        await patchAdmin(target, { username: next });
      }
    }

    setRenameDrafts((previous) => ({ ...previous, [id]: "" }));
  };

  const resetPassword = async (kind: "user" | "admin", id: string) => {
    const password = passwordDrafts[id] ?? "";

    if (!password) {
      setMessage("先输入新密码。");
      return;
    }

    if (kind === "user") {
      const target = data.users.find((item) => item.id === id);
      if (target) {
        await patchUser(target, { password });
      }
    } else {
      const target = admins.find((item) => item.id === id);
      if (target) {
        await patchAdmin(target, { password });
      }
    }

    setPasswordDrafts((previous) => ({ ...previous, [id]: "" }));
  };

  const handleExport = () => {
    const blob = new Blob([buildExport(data, admins)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `you-deserve-postgresql-backup-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("已导出 PostgreSQL 学习数据快照。");
  };

  if (!ready) {
    return (
      <section className="admin-panel">
        <p className="text-lg font-black text-ink">正在连接后台数据库...</p>
      </section>
    );
  }

  if (!admin) {
    return (
      <section className="admin-hero rounded-[2rem] border border-ink/10 p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/75 px-3 py-1 text-sm font-black text-ink">
              <ShieldCheck className="h-4 w-4 text-coral" />
              后台管理 · 独立管理员入口
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight text-ink sm:text-5xl">
              管理员和用户已经拆开。
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-ink/64">
              这里登录的是管理员账号，只能进入后台；用户端登录不会获得后台权限。所有用户、笔记、评论、互动和管理员账号都存进 PostgreSQL。
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">Admin Login</p>
            <h2 className="mt-2 text-2xl font-black text-ink">进入后台</h2>
            <div className="mt-5 grid gap-4">
              <input
                className="auth-input"
                onChange={(event) => setLoginForm((previous) => ({ ...previous, username: event.target.value }))}
                placeholder="管理员账号"
                value={loginForm.username}
              />
              <input
                className="auth-input"
                onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))}
                placeholder="管理员密码"
                type="password"
                value={loginForm.password}
              />
              <button className="primary-action" onClick={() => void handleLogin()} type="button">
                <KeyRound className="h-4 w-4" />
                登录后台
              </button>
            </div>
            {message ? <p className="mt-4 rounded-2xl bg-smoke px-4 py-3 text-sm font-bold text-ink/70">{message}</p> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="admin-hero rounded-[2rem] border border-ink/10 p-6 shadow-soft sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/75 px-3 py-1 text-sm font-black text-ink">
              <ShieldCheck className="h-4 w-4 text-coral" />
              PostgreSQL 后台 · {admin.username}
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight text-ink sm:text-5xl">运营管理台</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-ink/64">
              用户端和后台现在是两套账号、两套 session。后台只管理数据，不劫持用户登录态。
            </p>
          </div>
          <button className="danger-action" onClick={() => void handleLogout()} type="button">
            <LogOut className="h-4 w-4" />
            退出后台
          </button>
        </div>
      </section>

      <div className="admin-tabs">
        {adminTabs.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={`admin-tab ${tab === item.value ? "is-active" : ""}`}
              key={item.value}
              onClick={() => setTab(item.value)}
              type="button"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {message ? (
        <div className="rounded-[1.2rem] border border-ink/10 bg-white px-4 py-3 text-sm font-black text-ink/68 shadow-soft">
          {message}
        </div>
      ) : null}

      {tab === "overview" ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="admin-panel">
            <div className="admin-section-head">
              <div>
                <p>Database Snapshot</p>
                <h2>整体数据</h2>
              </div>
              <Database className="h-5 w-5 text-coral" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Users} label="用户 / 可用" value={`${globalStats.totalUsers} / ${globalStats.activeUsers}`} />
              <StatCard icon={ShieldCheck} label="管理员" value={globalStats.admins} />
              <StatCard icon={FileText} label="题库内容" value={questions.length} />
              <StatCard icon={Activity} label="有互动题目" value={globalStats.trackedQuestions} />
              <StatCard icon={Eye} label="浏览" value={globalStats.totalViews} />
              <StatCard icon={Heart} label="点赞" value={globalStats.totalLikes} />
              <StatCard icon={Bookmark} label="收藏" value={globalStats.totalFavorites} />
              <StatCard icon={MessageSquare} label="评论" value={globalStats.totalComments} />
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-section-head">
              <div>
                <p>Content Map</p>
                <h2>分类与路线</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {categories.slice(0, 6).map((name) => {
                const rows = allQuestionRows.filter((row) => row.question.category === name);
                const views = rows.reduce((sum, row) => sum + row.activity.views, 0);

                return (
                  <div className="admin-meter-row" key={name}>
                    <strong>{name}</strong>
                    <span>{rows.length} 道题 · {views} 次浏览</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {routes.map((name) => (
                <span className="admin-route-chip" key={name}>
                  <strong>{name}</strong>
                  <span>{allQuestionRows.filter((row) => row.question.route === name).length} 道题</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "users" ? (
        <section className="admin-panel">
          <div className="admin-section-head">
            <div>
              <p>User Accounts</p>
              <h2>用户管理</h2>
            </div>
            <UserCog className="h-5 w-5 text-coral" />
          </div>
          <div className="admin-form-band mt-5">
            <div>
              <strong>新建用户账号</strong>
              <p>这是用户端账号，只能登录学习站，不能进入后台。</p>
            </div>
            <div className="admin-inline-form">
              <input
                className="admin-input"
                onChange={(event) => setUserForm((previous) => ({ ...previous, username: event.target.value }))}
                placeholder="用户账号"
                value={userForm.username}
              />
              <input
                className="admin-input"
                onChange={(event) => setUserForm((previous) => ({ ...previous, password: event.target.value }))}
                placeholder="初始密码"
                type="password"
                value={userForm.password}
              />
              <button className="primary-action" onClick={() => void createUser()} type="button">
                创建用户
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {userRows.length > 0 ? (
              userRows.map((row) => (
                <div className="admin-user-row" key={row.user.id}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <strong>{row.user.username}</strong>
                      {row.user.disabled ? <span className="status-chip">已禁用</span> : <span className="status-chip is-mastered">可登录</span>}
                    </div>
                    <p>加入 {formatDateOnly(row.user.createdAt)} · 最近浏览 {formatDate(row.lastViewedAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-ink/55">
                      <span className="mini-metric"><Eye className="h-3.5 w-3.5" />{row.views} 浏览</span>
                      <span className="mini-metric"><Heart className="h-3.5 w-3.5" />{row.likes} 点赞</span>
                      <span className="mini-metric"><Bookmark className="h-3.5 w-3.5" />{row.favorites} 收藏</span>
                      <span className="mini-metric"><BookMarked className="h-3.5 w-3.5" />{row.mastered} 掌握</span>
                      <span className="mini-metric"><NotebookPen className="h-3.5 w-3.5" />{row.notes} 笔记</span>
                      <span className="mini-metric"><MessageSquare className="h-3.5 w-3.5" />{row.comments} 评论</span>
                    </div>
                    <div className="admin-inline-form mt-4">
                      <input
                        className="admin-input"
                        onChange={(event) => setRenameDrafts((previous) => ({ ...previous, [row.user.id]: event.target.value }))}
                        placeholder="新用户名"
                        value={renameDrafts[row.user.id] ?? ""}
                      />
                      <button className="ghost-action" onClick={() => void renameEntity("user", row.user.id, row.user.username)} type="button">
                        改名
                      </button>
                      <input
                        className="admin-input"
                        onChange={(event) => setPasswordDrafts((previous) => ({ ...previous, [row.user.id]: event.target.value }))}
                        placeholder="新密码"
                        type="password"
                        value={passwordDrafts[row.user.id] ?? ""}
                      />
                      <button className="ghost-action" onClick={() => void resetPassword("user", row.user.id)} type="button">
                        重置密码
                      </button>
                    </div>
                  </div>
                  <div className="admin-row-actions">
                    <button className="ghost-action" onClick={() => void patchUser(row.user, { disabled: !row.user.disabled })} type="button">
                      {row.user.disabled ? "启用" : "禁用"}
                    </button>
                    <button
                      className="ghost-action"
                      onClick={() => {
                        if (confirmAction(`确定清空 ${row.user.username} 的学习行为，但保留账号？`)) {
                          void adminRequest(`/api/admin/users/${encodeURIComponent(row.user.id)}/activity`, { method: "DELETE" });
                        }
                      }}
                      type="button"
                    >
                      <RotateCcw className="h-4 w-4" />
                      清行为
                    </button>
                    <button
                      className="danger-action"
                      onClick={() => {
                        if (confirmAction(`确定删除 ${row.user.username} 账号及其所有行为？`)) {
                          void adminRequest(`/api/admin/users/${encodeURIComponent(row.user.id)}`, { method: "DELETE" });
                        }
                      }}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      删除
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-empty">还没有用户账号。</div>
            )}
          </div>
        </section>
      ) : null}

      {tab === "admins" ? (
        <section className="admin-panel">
          <div className="admin-section-head">
            <div>
              <p>Admin Accounts</p>
              <h2>管理员管理</h2>
            </div>
            <ShieldCheck className="h-5 w-5 text-coral" />
          </div>
          <div className="admin-form-band mt-5">
            <div>
              <strong>新建管理员账号</strong>
              <p>管理员只进入后台，不参与用户端学习进度。</p>
            </div>
            <div className="admin-inline-form">
              <input
                className="admin-input"
                onChange={(event) => setAdminForm((previous) => ({ ...previous, username: event.target.value }))}
                placeholder="管理员账号"
                value={adminForm.username}
              />
              <input
                className="admin-input"
                onChange={(event) => setAdminForm((previous) => ({ ...previous, password: event.target.value }))}
                placeholder="初始密码"
                type="password"
                value={adminForm.password}
              />
              <button className="primary-action" onClick={() => void createAdmin()} type="button">
                创建管理员
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {admins.map((item) => (
              <div className="admin-user-row" key={item.id}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{item.username}</strong>
                    {item.id === admin.id ? <span className="status-chip is-favorited">当前后台账号</span> : null}
                    {item.disabled ? <span className="status-chip">已禁用</span> : <span className="status-chip is-mastered">可登录</span>}
                  </div>
                  <p>创建于 {formatDateOnly(item.createdAt)}</p>
                  <div className="admin-inline-form mt-4">
                    <input
                      className="admin-input"
                      onChange={(event) => setRenameDrafts((previous) => ({ ...previous, [item.id]: event.target.value }))}
                      placeholder="新管理员名"
                      value={renameDrafts[item.id] ?? ""}
                    />
                    <button className="ghost-action" onClick={() => void renameEntity("admin", item.id, item.username)} type="button">
                      改名
                    </button>
                    <input
                      className="admin-input"
                      onChange={(event) => setPasswordDrafts((previous) => ({ ...previous, [item.id]: event.target.value }))}
                      placeholder="新密码"
                      type="password"
                      value={passwordDrafts[item.id] ?? ""}
                    />
                    <button className="ghost-action" onClick={() => void resetPassword("admin", item.id)} type="button">
                      重置密码
                    </button>
                  </div>
                </div>
                <div className="admin-row-actions">
                  <button
                    className="ghost-action"
                    disabled={item.id === admin.id}
                    onClick={() => void patchAdmin(item, { disabled: !item.disabled })}
                    type="button"
                  >
                    {item.disabled ? "启用" : "禁用"}
                  </button>
                  <button
                    className="danger-action"
                    disabled={item.id === admin.id}
                    onClick={() => {
                      if (confirmAction(`确定删除管理员 ${item.username}？`)) {
                        void adminRequest(`/api/admin/admins/${encodeURIComponent(item.id)}`, { method: "DELETE" });
                      }
                    }}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "questions" ? (
        <section className="admin-panel">
          <div className="admin-section-head">
            <div>
              <p>Question Ops</p>
              <h2>题库互动管理</h2>
            </div>
          </div>
          <div className="admin-toolbar mt-5">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <input
                className="profile-search-input"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜题目、摘要、标签、路线..."
                type="search"
                value={query}
              />
            </div>
            <select className="admin-select" onChange={(event) => setCategory(event.target.value)} value={category}>
              <option value="all">全部分类</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select className="admin-select" onChange={(event) => setDifficulty(event.target.value as "all" | Difficulty)} value={difficulty}>
              <option value="all">全部难度</option>
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
            <select className="admin-select" onChange={(event) => setSort(event.target.value as QuestionSort)} value={sort}>
              <option value="signals">按互动</option>
              <option value="views">按浏览</option>
              <option value="comments">按评论</option>
              <option value="reading">按阅读时长</option>
            </select>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {questionRows.slice(0, 60).map((row) => (
              <QuestionAdminCard
                key={row.question.slug}
                onClear={() => {
                  if (confirmAction(`确定清空《${row.question.title}》的浏览、点赞、收藏、掌握、笔记和评论？`)) {
                    void adminRequest(`/api/admin/questions/${encodeURIComponent(row.question.slug)}/activity`, { method: "DELETE" });
                  }
                }}
                row={row}
              />
            ))}
            {questionRows.length === 0 ? <div className="admin-empty lg:col-span-2">当前筛选没有题目。</div> : null}
          </div>
        </section>
      ) : null}

      {tab === "comments" ? (
        <ContentPanel
          count={`${filteredCommentRows.length} / ${commentRows.length}`}
          onSearch={setContentQuery}
          query={contentQuery}
          title="评论管理"
        >
          {filteredCommentRows.length > 0 ? (
            filteredCommentRows.map((row) => (
              <div className="admin-content-row" key={row.comment.id}>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="status-chip">{row.question.category}</span>
                    <span className="status-chip">{row.comment.user}</span>
                  </div>
                  <h3>{row.question.title}</h3>
                  <p>{row.comment.content}</p>
                  <span>{formatDate(row.comment.createdAt)}</span>
                </div>
                <div className="admin-row-actions">
                  <Link className="ghost-action" href={`/questions/${row.question.slug}`}>
                    <ExternalLink className="h-4 w-4" />
                    查看
                  </Link>
                  <button
                    className="danger-action"
                    onClick={() => {
                      if (confirmAction("确定删除这条评论？")) {
                        void adminRequest(`/api/admin/comments/${encodeURIComponent(row.comment.id)}`, { method: "DELETE" });
                      }
                    }}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                    删除
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-empty">当前筛选下没有评论。</div>
          )}
        </ContentPanel>
      ) : null}

      {tab === "notes" ? (
        <ContentPanel count={`${filteredNoteRows.length} / ${noteRows.length}`} onSearch={setContentQuery} query={contentQuery} title="笔记管理">
          {filteredNoteRows.length > 0 ? (
            filteredNoteRows.map((row) => (
              <div className="admin-content-row" key={`${row.question.slug}-${row.user}`}>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="status-chip">{row.question.category}</span>
                    <span className="status-chip">{row.user}</span>
                  </div>
                  <h3>{row.question.title}</h3>
                  <p>{excerpt(row.note, 180)}</p>
                </div>
                <div className="admin-row-actions">
                  <Link className="ghost-action" href={`/questions/${row.question.slug}`}>
                    <ExternalLink className="h-4 w-4" />
                    查看
                  </Link>
                  <button
                    className="danger-action"
                    onClick={() => {
                      if (confirmAction("确定删除这条笔记？")) {
                        void adminRequest("/api/admin/notes", {
                          method: "DELETE",
                          body: JSON.stringify({ slug: row.question.slug, username: row.user })
                        });
                      }
                    }}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                    删除
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-empty">当前筛选下没有笔记。</div>
          )}
        </ContentPanel>
      ) : null}

      {tab === "data" ? (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="admin-panel">
            <div className="admin-section-head">
              <div>
                <p>Backup</p>
                <h2>数据备份</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <button className="primary-action justify-start" onClick={handleExport} type="button">
                <Download className="h-4 w-4" />
                下载 JSON 快照
              </button>
              <button
                className="ghost-action justify-start"
                onClick={() => {
                  void navigator.clipboard.writeText(buildExport(data, admins));
                  setMessage("已复制 PostgreSQL 数据快照。");
                }}
                type="button"
              >
                <Database className="h-4 w-4" />
                复制 JSON
              </button>
              <button
                className="danger-action justify-start"
                onClick={() => {
                  if (confirmAction("确定清空全部学习行为？用户和管理员账号会保留。")) {
                    void adminRequest("/api/admin/system/reset-activity", { method: "DELETE" });
                  }
                }}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                清空行为数据
              </button>
            </div>
          </div>

          <div className="admin-panel">
            <div className="admin-section-head">
              <div>
                <p>Health Check</p>
                <h2>数据巡检</h2>
              </div>
              <span className="rounded-full bg-smoke px-3 py-1 text-sm font-black text-ink/55">
                {dataHealth.orphanActivities.length + dataHealth.unknownUserRefs + dataHealth.emptyActivities.length} 个待处理项
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="admin-health-card">
                <strong>{dataHealth.orphanActivities.length}</strong>
                <span>旧题目记录</span>
              </div>
              <div className="admin-health-card">
                <strong>{dataHealth.unknownUserRefs}</strong>
                <span>无效用户引用</span>
              </div>
              <div className="admin-health-card">
                <strong>{dataHealth.emptyActivities.length}</strong>
                <span>空活动记录</span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="primary-action"
                onClick={() =>
                  void adminRequest("/api/admin/system/repair", {
                    method: "POST"
                  })
                }
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
                一键修复
              </button>
            </div>
            <p className="mt-4 text-sm font-bold leading-7 text-ink/58">
              巡检会清理旧题目 slug、空互动记录，以及导入或历史数据残留的无效引用。PostgreSQL 约束会继续兜住账号和行为表的关系。
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="admin-stat-card">
      <Icon className="h-5 w-5 text-coral" />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ContentPanel({
  children,
  count,
  onSearch,
  query,
  title
}: {
  children: React.ReactNode;
  count: string;
  onSearch: (next: string) => void;
  query: string;
  title: string;
}) {
  return (
    <section className="admin-panel">
      <div className="admin-section-head">
        <div>
          <p>Moderation</p>
          <h2>{title}</h2>
        </div>
        <span className="rounded-full bg-smoke px-3 py-1 text-sm font-black text-ink/55">{count}</span>
      </div>
      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
        <input
          className="profile-search-input"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="搜内容、用户、题目、分类..."
          type="search"
          value={query}
        />
      </div>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function QuestionAdminCard({ onClear, row }: { onClear: () => void; row: QuestionRow }) {
  return (
    <div className="admin-question-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="status-chip">{row.question.category}</span>
            <span className="status-chip">{row.question.difficulty}</span>
            <span className="status-chip">{row.question.route}</span>
          </div>
          <h3>{row.question.title}</h3>
          <p>{row.question.summary}</p>
        </div>
        <Link className="icon-button shrink-0" href={`/questions/${row.question.slug}`} title="查看题目">
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-ink/56">
        <span className="mini-metric"><Activity className="h-3.5 w-3.5" />{row.totalSignals} 信号</span>
        <span className="mini-metric"><Eye className="h-3.5 w-3.5" />{row.activity.views} 浏览</span>
        <span className="mini-metric"><Heart className="h-3.5 w-3.5" />{row.activity.likedBy.length}</span>
        <span className="mini-metric"><Bookmark className="h-3.5 w-3.5" />{row.activity.favoritedBy.length}</span>
        <span className="mini-metric"><BookMarked className="h-3.5 w-3.5" />{row.activity.masteredBy.length}</span>
        <span className="mini-metric"><NotebookPen className="h-3.5 w-3.5" />{row.noteCount}</span>
        <span className="mini-metric"><MessageSquare className="h-3.5 w-3.5" />{row.activity.comments.length}</span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-ink/42">
          {row.question.readingTime} 分钟 · {row.userViewers} 个用户看过
        </span>
        <button className="danger-action" onClick={onClear} type="button">
          <Trash2 className="h-4 w-4" />
          清空
        </button>
      </div>
    </div>
  );
}
