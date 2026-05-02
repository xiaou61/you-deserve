"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookHeart,
  Bookmark,
  Eye,
  Heart,
  MessageSquare,
  NotebookPen,
  Save,
  Sparkles
} from "lucide-react";

import { useStudy } from "@/components/study-provider";

type QuestionEngagementProps = {
  slug: string;
  title: string;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

export function QuestionEngagement({ slug, title }: QuestionEngagementProps) {
  const {
    currentUser,
    getActivity,
    incrementView,
    ready,
    saveNote,
    addComment,
    toggleFavorite,
    toggleLike,
    toggleMastered
  } = useStudy();
  const activity = ready
    ? getActivity(slug)
    : {
        views: 0,
        likedBy: [],
        favoritedBy: [],
        masteredBy: [],
        notesByUser: {},
        comments: []
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

  return (
    <section className="mt-6 space-y-6">
      <div className="rounded-[1.8rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-coral">Engagement</p>
            <h2 className="mt-2 text-2xl font-black text-ink">这道题别只是看过</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink/60">
              点赞、收藏、掌握、评论、笔记、浏览都已经接上本地记录。你现在打开的就是：
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
            onClick={() => handleResult(toggleLike(slug))}
            type="button"
          >
            <Heart className="h-4 w-4" />
            {status.liked ? "已点赞" : "点赞"}
          </button>
          <button
            className={`engagement-action ${status.favorited ? "is-active" : ""}`}
            onClick={() => handleResult(toggleFavorite(slug))}
            type="button"
          >
            <Bookmark className="h-4 w-4" />
            {status.favorited ? "已收藏" : "收藏"}
          </button>
          <button
            className={`engagement-action ${status.mastered ? "is-active mastered" : ""}`}
            onClick={() => handleResult(toggleMastered(slug))}
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
            placeholder={currentUser ? "把你真正会忘的点写下来。" : "先登录，笔记才会保存到本地。"}
            value={note}
          />

          <div className="mt-4 flex justify-end">
            <button
              className="primary-action"
              onClick={() => {
                const result = saveNote(slug, note);
                handleResult(result);
                if (result.ok) {
                  setDraftNotes((previous) => ({
                    ...previous,
                    [noteKey]: note.trim()
                  }));
                }
              }}
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
              onClick={() => {
                const result = addComment(slug, comment);
                handleResult(result);
                if (result.ok) {
                  setComment("");
                }
              }}
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
