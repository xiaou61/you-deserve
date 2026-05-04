import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin-dashboard";
import { getCategories, getQuestionMetas, getRoutes } from "@/lib/content";

export const metadata: Metadata = {
  title: "后台管理 | You Deserve",
  description: "管理 PostgreSQL 用户、管理员、题库互动、评论、笔记和数据备份。"
};

export default function AdminPage() {
  const questions = getQuestionMetas();
  const categories = getCategories();
  const routes = getRoutes();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <AdminDashboard categories={categories} questions={questions} routes={routes} />
    </main>
  );
}
