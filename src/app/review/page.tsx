import type { Metadata } from "next";

import { ReviewMode } from "@/components/review-mode";
import { getQuestionMetas } from "@/lib/content";

export const metadata: Metadata = {
  title: "复习模式 | You Deserve",
  description: "根据浏览、收藏、笔记和掌握状态自动排优先级，把要回刷的题连成连续复习流。"
};

type ReviewPageProps = {
  searchParams?: Promise<{
    filter?: string;
    category?: string;
    route?: string;
    slugs?: string;
    bundle?: string;
    fromBundle?: string;
  }>;
};

function asReviewFilter(value?: string) {
  if (value === "smart" || value === "pending" || value === "favorites" || value === "notes" || value === "recent") {
    return value;
  }

  return "smart";
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const questions = getQuestionMetas();
  const params = (await searchParams) ?? {};
  const slugScope = params.slugs
    ? params.slugs
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <ReviewMode
        initialBundleName={params.bundle ?? null}
        initialFromBundleName={params.fromBundle ?? null}
        initialCategory={params.category ?? null}
        initialFilter={asReviewFilter(params.filter)}
        initialRoute={params.route ?? null}
        initialSlugScope={slugScope}
        questions={questions}
      />
    </main>
  );
}
