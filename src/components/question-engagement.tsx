"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookHeart,
  Bookmark,
  Eye,
  GraduationCap,
  Heart,
  LayoutDashboard,
  MessageSquare,
  NotebookPen,
  Route,
  Save,
  Sparkles
} from "lucide-react";

import { useStudy } from "@/components/study-provider";
import type { QuestionActivity } from "@/lib/study-store";

type QuestionEngagementProps = {
  slug: string;
  title: string;
  route: string;
  totalQuestions: number;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

export function QuestionEngagement({ slug, title, route, totalQuestions }: QuestionEngagementProps) {
  const {
    currentUser,
    getActivity,
    getOverview,
    incrementView,
    ready,
    saveNote,
    addComment,
    toggleFavorite,
    toggleLike,
    toggleMastered
  } = useStudy();
  const fallbackActivity: QuestionActivity = {
    views: 0,
    likedBy: [],
    favoritedBy: [],
    masteredBy: [],
    viewedByUser: {},
    notesByUser: {},
    comments: []
  };
  const activity = ready ? getActivity(slug) : fallbackActivity;
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
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const noteKey = `${slug}:${currentUser ?? "guest"}`;
  const storedNote = currentUser ? activity.notesByUser[currentUser] ?? "" : "";
  const note = draftNotes[noteKey] ?? storedNote;

  useEffect(() => {
    if (ready) {
      incrementView(slug);
    }
  }, [incrementView, ready, slug]);

  const status = useMemo(
    () => ({
      liked: !!currentUser && activity.likedBy.includes(currentUser),
      favorited: !!currentUser && activity.favoritedBy.includes(currentUser),
      mastered: !!currentUser && activity.masteredBy.includes(currentUser)
    }),
    [activity.favoritedBy, activity.likedBy, activity.masteredBy, currentUser]
  );

  const handleResult = (result: { ok: boolean; message: string }) => {
    setMessage(result.message);
  };

  const handleAsyncResult = async (action: Promise<{ ok: boolean; message: string }>) => {
    handleResult(await action);
  };

  return (
    <section className="mt-6 space-y-6">
      <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">Engagement</p>
            <h2 className="mt-2 text-2xl font-black text-ink">这道题别只是看过</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink/60">
              点赞、收藏、掌握、评论、笔记、浏览都会保存到 PostgreSQL。你现在打开的就是：
              <span className="font-black text-ink"> {title}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="engagement-stat">
              <Eye className="h-4 w-4 text-teal" />
              <strong>{activity.views}</strong>
              <span>浏览</span>
            </div>
            <div className="engagement-stat">
              <Heart className="h-4 w-4 text-coral" />
              <strong>{activity.likedBy.length}</strong>
              <span>点赞</span>
            </div>
            <div className="engagement-stat">
              <Bookmark className="h-4 w-4 text-amber-strong" />
              <strong>{activity.favoritedBy.length}</strong>
              <span>收藏</span>
            </div>
            <div className="engagement-stat">
              <MessageSquare className="h-4 w-4 text-ink" />
              <strong>{activity.comments.length}</strong>
              <span>评论</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className={`engagement-action ${status.liked ? "is-active" : ""}`}
            onClick={() => void handleAsyncResult(toggleLike(slug))}
            type="button"
          >
            <Heart className="h-4 w-4" />
            {status.liked ? "已点赞" : "点赞"}
          </button>
          <button
            className={`engagement-action ${status.favorited ? "is-active" : ""}`}
            onClick={() => void handleAsyncResult(toggleFavorite(slug))}
            type="button"
          >
            <Bookmark className="h-4 w-4" />
            {status.favorited ? "已收藏" : "收藏"}
          </button>
          <button
            className={`engagement-action ${status.mastered ? "is-active mastered" : ""}`}
            onClick={() => void handleAsyncResult(toggleMastered(slug))}
            type="button"
          >
            <BookHeart className="h-4 w-4" />
            {status.mastered ? "已掌握" : "标记掌握"}
          </button>
        </div>

        {message ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-smoke px-4 py-2 text-sm font-bold text-ink/68">
            <Sparkles className="h-4 w-4 text-coral" />
            {message}
          </div>
        ) : null}
      </div>

      <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">Next Step</p>
            <h2 className="mt-2 text-2xl font-black text-ink">学完这一题，别断在这里</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink/60">
              这题属于 <span className="font-black text-ink">{route}</span> 路线。
              {status.mastered
                ? " 既然你已经标成掌握，更适合回个人中心看整体推进。"
                : status.favorited
                  ? " 你已经收藏了它，下一步可以直接回复习模式把这一条线继续刷下去。"
                  : " 如果觉得值得回看，先收藏；然后回复习模式继续把同类题串起来。"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link className="profile-summary-card block" href="/me">
              <div className="flex items-center gap-3">
                <div className="profile-milestone-icon">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <strong>回个人中心</strong>
                  <p>看掌握进度、目标和最近学习节奏。</p>
                </div>
              </div>
            </Link>
            <Link className="profile-summary-card block" href="/review">
              <div className="flex items-center gap-3">
                <div className="profile-milestone-icon">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <strong>继续刷题</strong>
                  <p>当前还有 {Math.max(0, totalQuestions - overview.masteredCount)} 道待补，直接回连续复习流。</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-smoke px-4 py-2 text-sm font-bold text-ink/68">
            <Route className="h-4 w-4 text-teal" />
            当前路线：{route}
          </div>
          {status.mastered ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-smoke px-4 py-2 text-sm font-bold text-ink/68">
              <BookHeart className="h-4 w-4 text-teal" />
              这题已经进入你的掌握清单
            </div>
          ) : null}
          {status.favorited ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-smoke px-4 py-2 text-sm font-bold text-ink/68">
              <Bookmark className="h-4 w-4 text-amber-strong" />
              已放进你的回刷清单
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mint text-ink">
              <NotebookPen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-ink">我的笔记</h3>
              <p className="text-sm text-ink/55">登录后每题都能单独记录。</p>
            </div>
          </div>

          <textarea
            className="note-area mt-5"
            onChange={(event) =>
              setDraftNotes((previous) => ({
                ...previous,
                [noteKey]: event.target.value
              }))
            }
            placeholder={currentUser ? "把你真正会忘的点写下来。" : "先登录，笔记才会保存到数据库。"}
            value={note}
          />

          <div className="mt-4 flex justify-end">
            <button
              className="primary-action"
              onClick={() => void (async () => {
                const result = await saveNote(slug, note);
                handleResult(result);
                if (result.ok) {
                  setDraftNotes((previous) => ({
                    ...previous,
                    [noteKey]: note.trim()
                  }));
                }
              })()}
              type="button"
            >
              <Save className="h-4 w-4" />
              保存笔记
            </button>
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-smoke text-ink">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-ink">讨论区</h3>
              <p className="text-sm text-ink/55">把追问、反例、记忆口诀都丢在这里。</p>
            </div>
          </div>

          <textarea
            className="comment-area mt-5"
            onChange={(event) => setComment(event.target.value)}
            placeholder={currentUser ? "比如：这个点和 ConcurrentHashMap 的区别我总容易混。" : "先登录，才能发表评论。"}
            value={comment}
          />

          <div className="mt-4 flex justify-end">
            <button
              className="primary-action"
              onClick={() => void (async () => {
                const result = await addComment(slug, comment);
                handleResult(result);
                if (result.ok) {
                  setComment("");
                }
              })()}
              type="button"
            >
              发表评论
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {activity.comments.length > 0 ? (
              activity.comments.map((item) => (
                <article className="comment-card" key={item.id}>
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm font-black text-ink">{item.user}</strong>
                    <span className="text-xs font-bold text-ink/45">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-ink/68">{item.content}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[1.2rem] bg-smoke px-4 py-5 text-sm font-bold text-ink/52">
                还没有评论，你可以先把第一条追问丢进来。
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
