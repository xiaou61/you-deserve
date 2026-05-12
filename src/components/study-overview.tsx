"use client";

import { BookMarked, Eye, Heart, NotebookPen } from "lucide-react";

import { useStudy } from "@/components/study-provider";

type StudyOverviewProps = {
  totalQuestions: number;
};

export function StudyOverview({ totalQuestions }: StudyOverviewProps) {
  const { currentUser, getOverview, ready } = useStudy();
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
  const rawProgress = totalQuestions > 0 ? Math.round((overview.masteredCount / totalQuestions) * 100) : 0;
  const progress = overview.masteredCount > 0 ? Math.max(1, rawProgress) : 0;
  const remaining = Math.max(totalQuestions - overview.masteredCount, 0);

  return (
    <div className="rounded-[1.6rem] border border-white/70 bg-white/68 p-6 shadow-soft backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[1.2rem] border border-white/75 bg-white/78 text-teal shadow-[0_10px_28px_rgba(15,23,40,0.08)]">
          <BookMarked className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink/55">学习闭环</p>
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink">{currentUser ? `${currentUser} 的学习进度` : "先登录再沉淀你的学习轨迹"}</h2>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-[1.15rem] border border-white/70 bg-white/76 px-2 py-4">
          <p className="text-2xl font-semibold text-teal">{remaining}</p>
          <p className="mt-1 text-ink/55">待刷</p>
        </div>
        <div className="rounded-[1.15rem] border border-white/70 bg-white/76 px-2 py-4">
          <p className="text-2xl font-semibold text-[#3478f6]">{overview.masteredCount}</p>
          <p className="mt-1 text-ink/55">已掌握</p>
        </div>
        <div className="rounded-[1.15rem] border border-white/70 bg-white/76 px-2 py-4">
          <p className="text-2xl font-semibold text-ink">{progress}%</p>
          <p className="mt-1 text-ink/55">进度</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-bold text-ink/62">
        <div className="rounded-[1.1rem] border border-white/70 bg-white/66 px-3 py-3">
          <Heart className="mb-2 h-4 w-4 text-[#3478f6]" />
          {overview.totalLikes} 个点赞
        </div>
        <div className="rounded-[1.1rem] border border-white/70 bg-white/66 px-3 py-3">
          <NotebookPen className="mb-2 h-4 w-4 text-teal" />
          {overview.noteCount} 条笔记
        </div>
        <div className="rounded-[1.1rem] border border-white/70 bg-white/66 px-3 py-3">
          <Eye className="mb-2 h-4 w-4 text-ink/65" />
          {overview.totalViews} 次浏览
        </div>
      </div>
    </div>
  );
}
