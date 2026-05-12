"use client";

import Link from "next/link";
import { ArrowUpRight, Bookmark, Clock3, Eye, Heart, NotebookPen } from "lucide-react";

import { useStudy } from "@/components/study-provider";
import type { QuestionMeta } from "@/lib/content";
import type { QuestionActivity } from "@/lib/study-store";

const difficultyText: Record<QuestionMeta["difficulty"], string> = {
  easy: "入门",
  medium: "进阶",
  hard: "硬仗"
};

type QuestionCardProps = {
  question: QuestionMeta;
  compact?: boolean;
};

export function QuestionCard({ question, compact = false }: QuestionCardProps) {
  const { currentUser, getActivity, ready } = useStudy();
  const fallbackActivity: QuestionActivity = {
    views: 0,
    likedBy: [],
    favoritedBy: [],
    masteredBy: [],
    viewedByUser: {},
    notesByUser: {},
    comments: []
  };
  const activity = ready ? getActivity(question.slug) : fallbackActivity;
  const isMastered = ready && !!currentUser && activity.masteredBy.includes(currentUser);
  const hasNote = ready && !!currentUser && !!activity.notesByUser[currentUser]?.trim();
  const isFavorited = ready && !!currentUser && activity.favoritedBy.includes(currentUser);
  const personalViews = ready && currentUser ? (activity.viewedByUser[currentUser]?.count ?? 0) : 0;
  const needsReview = ready && !!currentUser && !isMastered && (isFavorited || hasNote || personalViews >= 2);

  return (
    <Link className="question-card group" href={`/questions/${question.slug}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/80 bg-white/82 px-2.5 py-1 text-xs font-semibold text-teal shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              {question.category}
            </span>
            <span className="rounded-full border border-white/70 bg-[#f3f7ff] px-2.5 py-1 text-xs font-semibold text-ink/55">
              {difficultyText[question.difficulty]}
            </span>
            {isMastered ? <span className="status-chip is-mastered">已掌握</span> : null}
            {isFavorited ? <span className="status-chip is-favorited">已收藏</span> : null}
            {needsReview ? <span className="status-chip is-review">待回刷</span> : null}
          </div>
          <h3 className="mt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-ink group-hover:text-teal">
            {question.title}
          </h3>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[1.1rem] border border-white/80 bg-white/82 text-teal shadow-[0_10px_28px_rgba(15,23,40,0.08)] transition group-hover:-translate-y-1 group-hover:bg-[#0a84ff] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {!compact ? <p className="mt-4 leading-7 text-ink/65">{question.summary}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-ink/48">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-4 w-4" />
          {question.readingTime} 分钟
        </span>
        <span>适合场景：{question.scene}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-ink/58">
        <span className="mini-metric">
          <Eye className="h-3.5 w-3.5" />
          {personalViews > 0 ? `我看过 ${personalViews}` : activity.views}
        </span>
        <span className="mini-metric">
          <Heart className="h-3.5 w-3.5" />
          {activity.likedBy.length}
        </span>
        <span className="mini-metric">
          <Bookmark className="h-3.5 w-3.5" />
          {activity.favoritedBy.length}
        </span>
        <span className="mini-metric">
          <NotebookPen className="h-3.5 w-3.5" />
          {hasNote ? "有笔记" : "未记"}
        </span>
      </div>
    </Link>
  );
}
