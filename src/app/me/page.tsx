import type { Metadata } from "next";

import { PersonalCenter } from "@/components/personal-center";
import { getQuestionMetas } from "@/lib/content";

export const metadata: Metadata = {
  title: "个人中心 | You Deserve",
  description: "查看浏览记录、收藏、点赞、掌握进度、笔记和评论，把学习轨迹收拢成一个能继续复盘的个人中心。"
};

export default function PersonalCenterPage() {
  const questions = getQuestionMetas();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <PersonalCenter questions={questions} />
    </main>
  );
}
