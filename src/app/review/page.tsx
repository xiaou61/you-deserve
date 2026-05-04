import type { Metadata } from "next";

import { ReviewMode } from "@/components/review-mode";
import { getQuestionMetas } from "@/lib/content";

export const metadata: Metadata = {
  title: "复习模式 | You Deserve",
  description: "根据浏览、收藏、笔记和掌握状态自动排优先级，把要回刷的题连成连续复习流。"
};

export default function ReviewPage() {
  const questions = getQuestionMetas();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <ReviewMode questions={questions} />
    </main>
  );
}
